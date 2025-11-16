"use client";
import { useSession } from "next-auth/react";

import Osasboard from '@/app/ui/osas/osasboard';
import Osasbar from '../ui/osas/osasbar';
import NotificationSidebar from '../ui/notifbar';
export default function dashboard() {
  const { data: session, status } = useSession();
    if (!session) return <p>Not logged in</p>;
    
    return <><Osasboard /><NotificationSidebar /></>;
}