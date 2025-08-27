"use client";

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
import { ContactStatus } from "@/convex/_internals/status";
import { useMutation, useQuery } from "convex/react";
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
                  {contact.contactNotificationLogs.map((log) => (
                    <React.Fragment key={log._id}>
                      <div>
                        <p>
                          {log.fromStatus.toLowerCase().split("_").join(" ")}{" "}
                          {" -> "}
                          {log.toStatus.toLowerCase().split("_").join(" ")}
                        </p>
                        <p>{log.message}</p>
                        <p>{new Date(log.sentAt).toLocaleString()}</p>
                      </div>

                      <Separator />
                    </React.Fragment>
                  ))}
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
