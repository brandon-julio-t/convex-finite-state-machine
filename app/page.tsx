"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { ContactStatus } from "@/convex/_internals/contactStatus";
import { useMutation, useQuery } from "convex/react";
import { ArrowRightIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const HomePage = () => {
  const contacts = useQuery(api.domains.contacts.getContacts);

  const updateContactStatus = useMutation(
    api.domains.contacts.updateContactStatus,
  );

  return (
    <div className="min-h-svh bg-muted/25 grid place-items-center">
      <main className="container mx-auto p-4 flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Contacts</h1>

        <section className="flex flex-col gap-6">
          {contacts?.map((contact) => (
            <Card key={contact._id}>
              <CardHeader>
                <CardTitle>{contact.name}</CardTitle>

                <CardAction>
                  <Select
                    value={contact.status}
                    onValueChange={(value) => {
                      toast.promise(
                        updateContactStatus({
                          contactId: contact._id,
                          status: value,
                        }),
                        {
                          loading: "Updating contact status...",
                          success: "Contact status updated",
                          error: "Failed to update contact status",
                        },
                      );
                    }}
                  >
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ContactStatus).map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                          className="capitalize"
                        >
                          {status.toLowerCase().split("_").join(" ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardAction>
              </CardHeader>

              <CardContent>
                <section className="flex flex-col gap-6">
                  {contact.contactNotificationLogs.length <= 0 ? (
                    <p className="text-sm text-muted-foreground">No logs yet</p>
                  ) : (
                    contact.contactNotificationLogs.map((log) => (
                      <React.Fragment key={log._id}>
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-row items-center gap-2">
                            <Badge variant="outline">
                              {log.fromStatus
                                .toLowerCase()
                                .split("_")
                                .join(" ")}
                            </Badge>

                            {log.toStatus && (
                              <>
                                <ArrowRightIcon className="size-4" />

                                <Badge variant="outline">
                                  {log.toStatus
                                    .toLowerCase()
                                    .split("_")
                                    .join(" ")}
                                </Badge>
                              </>
                            )}
                          </div>

                          <p className="text-sm">{log.message}</p>

                          <p className="text-sm">
                            {new Date(log.sentAt).toLocaleString()}
                          </p>
                        </div>

                        <Separator className="last:hidden" />
                      </React.Fragment>
                    ))
                  )}
                </section>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
