"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Clock, Save, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useProfile } from "@/lib/contexts/ProfileContext";
import { useToast } from "@/hooks/use-toast";
import createClerkSupabaseClient from "@/lib/clerkSupabaseClient";
import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user } = useUser();
  const supabase = createClerkSupabaseClient();

  const [pitToken, setPitToken] = useState("");
  const [locationId, setLocationId] = useState("");
  const [originalPitToken, setOriginalPitToken] = useState<string | null>(null);
  const [originalLocationId, setOriginalLocationId] = useState<string | null>(
    null
  );
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isPhoneEditing, setIsPhoneEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckupCallsSaving, setIsCheckupCallsSaving] = useState(false);

  const [checkupCalls, setCheckupCalls] = useState({
    enabled: false,
    morningTime: "09:00",
    eveningTime: "17:00",
    enableMorning: true,
    enableEvening: false,
  });

  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  // VAPI phone number state
  const [vapiPhoneNumber, setVapiPhoneNumber] = useState<string>("");
  const [loadingPhoneNumber, setLoadingPhoneNumber] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState<string | null>(null);

  const handleSaveCheckupSettings = async () => {
    setIsCheckupCallsSaving(true);

    const userId = user?.id;
    if (!userId) {
      console.error("No authenticated user found; unable to save to profile");
      setIsSaving(false);
      return;
    }
    // Show success message or update UI
    try {
      const { error } = await supabase
        .from("profile")
        .update({ checkupCalls: checkupCalls })
        .eq("user_id", user?.id);

      if (error) {
        console.error("Failed to save GHL settings to profile:", error);
      }
    } catch (error) {
      console.error("Failed to save GHL settings", error);
    } finally {
      setIsCheckupCallsSaving(false);
    }
  };

  const handleSavePitAndLocation = async () => {
    setIsSaving(true);
    try {
      const userId = user?.id;
      if (!userId) {
        console.error("No authenticated user found; unable to save to profile");
        setIsSaving(false);
        return;
      }

      const res = await fetch("/api/test-mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitToken, locationId }),
      });

      const data = await res.json();

      const payload = {
        ghl_pit_token: pitToken || null,
        ghl_location_id: locationId || null,
        phone_number: data.location.phone,
        email: data.location.email
      };

      const { error } = await supabase
        .from("profile")
        .update(payload)
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to save GHL settings to profile:", error);
      } else {
        console.log("Saved GHL settings to profile table");
        setOriginalPitToken(payload.ghl_pit_token ?? null);
        setOriginalLocationId(payload.ghl_location_id ?? null);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to save GHL settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setPitToken(originalPitToken ?? "");
    setLocationId(originalLocationId ?? "");
    setIsEditing(false);
  };

  const handleCancelPhoneEdit = () => {
    setPhoneNumber(originalPhoneNumber ?? "");
    setIsPhoneEditing(false);
  };

  const handleSavePhoneNumber = async () => {
    setIsSaving(true);
    try {
      const userId = user?.id;
      if (!userId) {
        console.error("No authenticated user found; unable to save to profile");
        setIsSaving(false);
        return;
      }

      const { error } = await supabase
        .from("profile")
        .update({ phone_number: phoneNumber || null })
        .eq("user_id", userId);

      if (error) {
        console.error("Failed to save phone number to profile:", error);
      } else {
        console.log("Saved phone number to profile table");
        setOriginalPhoneNumber(phoneNumber || null);
        setIsPhoneEditing(false);
      }
    } catch (err) {
      console.error("Failed to save phone number", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Load phone number from profile on mount
  useEffect(() => {
    const loadPhoneNumber = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("profile")
        .select("vapi_phone_number, vapi_phone_number_id, email")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setEmail(data.email);
        if (data.vapi_phone_number) {
          setVapiPhoneNumber(data.vapi_phone_number);
        } else {
          setVapiPhoneNumber("");
        }
      }
    };
    loadPhoneNumber();
  }, [user?.id, supabase]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const userId = user?.id;
        if (!userId) {
          setLoadingProfile(false);
          return;
        }

        const { data, error } = await supabase
          .from("profile")
          .select("ghl_pit_token,ghl_location_id, checkupCalls, phone_number")
          .eq("user_id", userId)
          .single();

        if (error) {
          // no profile yet or other error
          console.debug(
            "No profile found or error while fetching profile:",
            error.message || error
          );
        }

        if (data) {
          setOriginalPitToken(data.ghl_pit_token ?? null);
          setOriginalLocationId(data.ghl_location_id ?? null);
          setOriginalPhoneNumber(data.phone_number ?? null);
          setPitToken(data.ghl_pit_token ?? "");
          setLocationId(data.ghl_location_id ?? "");
          setPhoneNumber(data.phone_number ?? "");
          setCheckupCalls(
            data.checkupCalls ?? {
              enabled: false,
              morningTime: "09:00",
              eveningTime: "17:00",
              enableMorning: true,
              enableEvening: false,
            }
          );
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  const maskToken = (t?: string | null) => {
    if (!t) return "";
    if (t.length <= 8) return "•".repeat(t.length);
    return `${t.slice(0, 4)}…${t.slice(-4)}`;
  };

  const handleTestMcp = async () => {
    setTestResponse(null);
    try {
      const res = await fetch("/api/test-mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitToken, locationId }),
      });

      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(String(err?.message || err));
    }
  };

  const handleCheckupCallUpdate = async (field: string, value: any) => {
    setCheckupCalls((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler to create a new phone number for the user
  const handleCreatePhoneNumber = async () => {
    if (!user?.id) return;
    setLoadingPhoneNumber(true);
    setPhoneNumberError(null);
    try {
      const res = await fetch("/api/vapi/phone-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const result = await res.json();
      const newNumber = result?.phoneNumber;
      const newNumberId = result?.phoneNumberId;

      if (newNumber) {
        setVapiPhoneNumber(newNumber);
        // Save to DB
        await supabase
          .from("profile")
          .update({
            vapi_phone_number: newNumber,
            vapi_phone_number_id: newNumberId,
          })
          .eq("user_id", user.id);
      } else {
        setPhoneNumberError("Failed to create phone number");
      }
    } catch (err: any) {
      setPhoneNumberError(err?.message || "Failed to create phone number");
    } finally {
      setLoadingPhoneNumber(false);
    }
  };

  return (
    <>
      <div className="flex-1 p-6 overflow-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>GHL PIT & Location</CardTitle>
            <CardDescription>
              Configure PIT token and default Location ID for MCP calls
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row space-x-4 items-start justify-start">
            <div className="space-y-2 w-full">
              {loadingProfile ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">GHL PIT Token</label>
                    {!isEditing && originalPitToken ? (
                      <div className="flex items-center justify-between border rounded px-3 py-2">
                        <span className="text-sm">
                          {maskToken(originalPitToken)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <Input
                        type="password"
                        placeholder="Enter your GHL PIT token"
                        value={pitToken}
                        onChange={(e) => setPitToken(e.target.value)}
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      Used to authenticate MCP requests (PIT token)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location ID</label>
                    {!isEditing && originalLocationId ? (
                      <div className="flex items-center justify-between border rounded px-3 py-2">
                        <span className="text-sm">{originalLocationId}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <Input
                        placeholder="Enter default Location ID"
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                      />
                    )}
                    <p className="text-xs text-muted-foreground">
                      Optional — used as `locationId` header when calling MCP
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSavePitAndLocation}
                          className="flex-1"
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save GHL Settings"}
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={handleCancelEdit}
                          className="w-40"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={handleSavePitAndLocation}
                          className="flex-1"
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save GHL Settings"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleTestMcp}
                          className="w-40"
                        >
                          Test MCP Connection
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* <div className="p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium mb-1">How to get your API key:</p>
                                <ol className="text-xs text-muted-foreground space-y-1">
                                    <li>1. Log into your GoHighLevel account</li>
                                    <li>2. Go to Settings → Integrations</li>
                                    <li>3. Find "API Keys" section</li>
                                    <li>4. Generate a new API key</li>
                                    <li>5. Copy and paste it here</li>
                                </ol>
                            </div> */}

            {testResponse && (
              <pre className="w-full h-[372px] mt-2 p-2 bg-slate-800 text-white rounded text-xs overflow-auto">
                {testResponse}
              </pre>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>VAPI Phone Number</CardTitle>
            <CardDescription>
              {vapiPhoneNumber
                ? `Your VAPI phone number: ${vapiPhoneNumber}`
                : "You do not have a VAPI phone number yet."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vapiPhoneNumber ? (
                <>
                  <div className="flex items-center justify-between border rounded px-3 py-2">
                    <span className="text-sm">{vapiPhoneNumber}</span>
                    {/* <Button onClick={handleCreatePhoneNumber} disabled={loadingPhoneNumber}>
                                            {loadingPhoneNumber ? "Creating..." : "Create New Phone Number"}
                                        </Button> */}
                  </div>
                </>
              ) : (
                <Button
                  onClick={handleCreatePhoneNumber}
                  disabled={loadingPhoneNumber}
                >
                  {loadingPhoneNumber ? "Creating..." : "Create Phone Number"}
                </Button>
              )}
              {phoneNumberError && (
                <p className="text-xs text-red-500">{phoneNumberError}</p>
              )}
              <div>
                <span className="text-sm font-medium">Outbound Phone Number</span>
                {!isPhoneEditing && originalPhoneNumber ? (
                  <div className="flex items-center justify-between border rounded px-3 py-2 mt-1">
                    <span className="text-sm">{originalPhoneNumber}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsPhoneEditing(true)}
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
                  <div className="mt-1">
                    <Input
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter outbound phone number"
                    />
                    <div className="flex space-x-2 mt-2">
                      <Button
                        onClick={handleSavePhoneNumber}
                        size="sm"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                      {isPhoneEditing && (
                        <Button
                          variant="ghost"
                          onClick={handleCancelPhoneEdit}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Phone number used for outbound calls
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>AI Checkup Calls</span>
              {/* send call button */}
              <Button
                variant="outline"
                onClick={() => { }}
                disabled={!vapiPhoneNumber}
                className="ml-auto"
              >
                Send Call
              </Button>
            </CardTitle>
            <CardDescription>
              Configure automated checkup calls with your AI assistant (maximum
              2 per day)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-semibold">Enable AI Checkup Calls</p>
                <p className="text-sm text-muted-foreground">
                  Receive automated calls to discuss your business progress
                </p>
              </div>
              <Button
                variant={checkupCalls.enabled ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  handleCheckupCallUpdate("enabled", !checkupCalls.enabled)
                }
                disabled={!pitToken || !vapiPhoneNumber}
              >
                {checkupCalls.enabled ? "Enabled" : "Disabled"}
              </Button>
            </div>

            {checkupCalls.enabled && (
              <div className="space-y-4">
                {/* Morning Call Settings */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Morning Checkup</p>
                      <p className="text-sm text-muted-foreground">
                        Start your day with business insights
                      </p>
                    </div>
                    <Button
                      variant={
                        checkupCalls.enableMorning ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleCheckupCallUpdate(
                          "enableMorning",
                          !checkupCalls.enableMorning
                        )
                      }
                    >
                      {checkupCalls.enableMorning ? "On" : "Off"}
                    </Button>
                  </div>
                  {checkupCalls.enableMorning && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={checkupCalls.morningTime}
                        onChange={(e) =>
                          handleCheckupCallUpdate("morningTime", e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">
                        Daily call time
                      </span>
                    </div>
                  )}
                </div>

                {/* Evening Call Settings */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Evening Checkup</p>
                      <p className="text-sm text-muted-foreground">
                        Review your day and plan ahead
                      </p>
                    </div>
                    <Button
                      variant={
                        checkupCalls.enableEvening ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        handleCheckupCallUpdate(
                          "enableEvening",
                          !checkupCalls.enableEvening
                        )
                      }
                    >
                      {checkupCalls.enableEvening ? "On" : "Off"}
                    </Button>
                  </div>
                  {checkupCalls.enableEvening && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={checkupCalls.eveningTime}
                        onChange={(e) =>
                          handleCheckupCallUpdate("eveningTime", e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">
                        Daily call time
                      </span>
                    </div>
                  )}
                </div>

                {/* Call Topics */}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">
                    What we'll discuss:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Daily lead and opportunity updates</li>
                    <li>• Conversion rate analysis and recommendations</li>
                    <li>• Priority tasks and action items</li>
                    <li>• Business performance insights</li>
                    <li>• Strategic planning and goal tracking</li>
                  </ul>
                </div>
              </div>
            )}
            <Button
              onClick={handleSaveCheckupSettings}
              className="w-full"
              disabled={isCheckupCallsSaving}
            >
              {isCheckupCallsSaving
                ? "Saving..."
                : "Save Checkup Call Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
