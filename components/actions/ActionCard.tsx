"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnyActionDefinition } from "@/lib/actions";
import {
  ArrowRightLeft,
  BellOff,
  Briefcase,
  Calendar,
  CalendarClock,
  CalendarPlus,
  Copy,
  DollarSign,
  FileCog,
  FilePlus,
  GitBranch,
  Hash,
  Link as LinkIcon,
  ListChecks,
  ListPlus,
  Mail,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  Receipt,
  Tag,
  Tags,
  Trophy,
  UserCircle,
  UserCog,
  UserPlus,
  UserRoundCheck,
} from "lucide-react";
import { ReactNode, useMemo } from "react";

function renderIcon(name: string): ReactNode {
  const map: Record<string, ReactNode> = {
    GitBranch: <GitBranch className="h-5 w-5" />,
    ListPlus: <ListPlus className="h-5 w-5" />,
    Calendar: <Calendar className="h-5 w-5" />,
    Copy: <Copy className="h-5 w-5" />,
    FilePlus: <FilePlus className="h-5 w-5" />,
    Tags: <Tags className="h-5 w-5" />,
    Tag: <Tag className="h-5 w-5" />,
    ListChecks: <ListChecks className="h-5 w-5" />,
    UserPlus: <UserPlus className="h-5 w-5" />,
    Hash: <Hash className="h-5 w-5" />,
    FileCog: <FileCog className="h-5 w-5" />,
    CalendarPlus: <CalendarPlus className="h-5 w-5" />,
    Briefcase: <Briefcase className="h-5 w-5" />,
    UserRoundCheck: <UserRoundCheck className="h-5 w-5" />,
    Upload: <Copy className="h-5 w-5" />,
    UserCog: <UserCog className="h-5 w-5" />,
    MessageSquare: <MessageSquare className="h-5 w-5" />,
    Mail: <Mail className="h-5 w-5" />,
    PhoneCall: <PhoneCall className="h-5 w-5" />,
    MessageCircle: <MessageCircle className="h-5 w-5" />,
    Workflow: <ListChecks className="h-5 w-5" />,
    BellOff: <BellOff className="h-5 w-5" />,
    StickyNote: <FilePlus className="h-5 w-5" />,
    ArrowRightLeft: <ArrowRightLeft className="h-5 w-5" />,
    DollarSign: <DollarSign className="h-5 w-5" />,
    UserCircle: <UserCircle className="h-5 w-5" />,
    Trophy: <Trophy className="h-5 w-5" />,
    Receipt: <Receipt className="h-5 w-5" />,
    Link: <LinkIcon className="h-5 w-5" />,
    CalendarClock: <CalendarClock className="h-5 w-5" />,
  };
  return map[name] ?? <ListChecks className="h-5 w-5" />;
}

export function ActionCard({ action, onSelect }: { action: AnyActionDefinition; onSelect: (action: AnyActionDefinition) => void }) {
  const Icon = useMemo(() => renderIcon(action.icon), [action.icon]);
  const isStub = String(action.execute) === String(() => {}) || false;
  const disabled = !action.execute || (action.execute && action.execute.name === "stubExecute");

  return (
    <Card className={`transition-shadow ${disabled ? "opacity-60" : "hover:shadow-md"}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          {Icon}
          <CardTitle className="text-base font-semibold">{action.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground min-h-10">{action.description ?? ""}</p>
        <div className="mt-3">
          <Button size="sm" onClick={() => onSelect(action)} disabled={disabled}>
            Run
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


