import { MessageCircle, AlertCircleIcon } from "lucide-react"


export default function Notification() {
    return (
        <div>
            <div className="flex flex-col gap-1">
                <p className="text-2xl font-bold">
                    Notifications
                </p>
                <p className="text-xs">Messages and alerts on your account and menu</p>
            </div>
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="w-full max-w-md rounded-xl border border-theme bg-[var(--card)] p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                            <AlertCircleIcon className="h-5 w-5" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <p className="text-base font-semibold text-[var(--foreground)]">
                                Service Provider's Message
                            </p>

                            <p className="text-sm leading-5 text-muted-foreground">
                                Currently, the notification service is unavailable due to
                                some technical issues.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}