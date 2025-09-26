"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

interface Profile {
    id: number;
    user_id: string;
    email: string | null;
    created_at: string;
    ghl_pit_token: string | null;
    ghl_location_id: string | null;
    vapi_phone_number: string | null;
    checkupCalls: any | null;
    vapi_phone_number_id: string | null;
}

interface ProfileContextType {
    profile: Profile | null;
    loading: boolean;
    error: string | null;
    refetchProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoaded } = useUser();
    const { session } = useSession();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createSupabaseClient = async () => {
        const clerkToken = await session?.getToken({
            template: "supabase",
        });

        return createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${clerkToken}`,
                    },
                },
            }
        );
    };

    const fetchProfile = async () => {
        if (!user || !isLoaded || !session) return;

        setLoading(true);
        setError(null);

        try {
            const supabase = await createSupabaseClient();
            const { data, error } = await supabase
                .from('profile')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No profile found, create a new one
                    const userEmail = user.emailAddresses?.[0]?.emailAddress || null;
                    const { data: newProfile, error: insertError } = await supabase
                        .from('profile')
                        .insert([{ 
                            user_id: user.id,
                            email: userEmail
                        }])
                        .select()
                        .single();

                    if (insertError) {
                        throw insertError;
                    }
                    setProfile(newProfile);
                } else {
                    throw error;
                }
            } else {
                setProfile(data);
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user, isLoaded, session]);

    const value: ProfileContextType = {
        profile,
        loading,
        error,
        refetchProfile: fetchProfile,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};