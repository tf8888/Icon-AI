'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Mail, Phone, Search, TrendingUp, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { filterByCategory, paginate } from "@/lib/actions";
import { ACTIONS } from "@/lib/actions/registry";
import { ActionGrid } from "@/components/actions/ActionGrid";
import { ActionModal } from "@/components/actions/ActionModal";


const stats = {
  totalContacts: 1247,
  newLeads: 23,
  conversionRate: 12.5,
  activeDeals: 8,
}

const recentContacts = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "(555) 123-4567",
    status: "hot",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@example.com",
    phone: "(555) 234-5678",
    status: "warm",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "(555) 345-6789",
    status: "cold",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 4,
    name: "Alex Rodriguez",
    email: "alex@example.com",
    phone: "(555) 456-7890",
    status: "hot",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "hot":
      return "bg-red-100 text-red-800"
    case "warm":
      return "bg-yellow-100 text-yellow-800"
    case "cold":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function ActivityPage() {

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"Attract" | "Capture" | "Nurture" | "Convert">("Nurture")
  const [page, setPage] = useState(1)
  const [selectedAction, setSelectedAction] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const actions = filterByCategory(ACTIONS, activeTab)
  const runnable = actions.filter((a: any) => a?.execute && a.execute.name !== "stubExecute")
  const { items, totalPages } = paginate(runnable, page, 8)

  return (
    <>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {(["Attract", "Capture", "Nurture", "Convert"] as const).map((tab) => (
              <Button key={tab} variant={activeTab === tab ? "default" : "outline"} size="sm" onClick={() => { setActiveTab(tab); setPage(1); }}>
                {tab}
              </Button>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">Page {page} / {totalPages}</div>
        </div>
        <ActionGrid
          actions={items}
          onSelect={(a) => {
            setSelectedAction(a)
            setModalOpen(true)
          }}
        />
        {runnable.length > 8 && <div className="flex items-center justify-end gap-2 mt-4">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
        }
      </div>
      <div className="flex-1 p-6 overflow-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle> Contacts</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                      <AvatarFallback>
                        {contact.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                      <p className="text-sm text-muted-foreground">{contact.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <ActionModal
        action={selectedAction}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(values) => {
          // Backend wiring will be added: POST to /api/actions/execute
          setModalOpen(false)
        }}
      />
    </>
  )
}
