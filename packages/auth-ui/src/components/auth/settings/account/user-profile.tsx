"use client";

import {
  useAuth,
  useSession,
  useUpdateUser,
} from "@workspace/auth-ui/lib/auth-react";
import { Button } from "@workspace/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/ui/card";
import { Field, FieldError } from "@workspace/ui/components/ui/field";
import { Input } from "@workspace/ui/components/ui/input";
import { Label } from "@workspace/ui/components/ui/label";
import { Skeleton } from "@workspace/ui/components/ui/skeleton";
import { toast } from "@workspace/ui/components/ui/sonner";
import { Spinner } from "@workspace/ui/components/ui/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { type SyntheticEvent, useState } from "react";

export interface UserProfileProps {
  className?: string;
}

/**
 * Profile card for updating the authenticated user's display name.
 */
export function UserProfile({ className }: UserProfileProps) {
  const { authClient, localization } = useAuth();
  const { data: session } = useSession(authClient);

  const { mutate: updateUser, isPending } = useUpdateUser(authClient, {
    onSuccess: () => toast.success(localization.settings.profileUpdatedSuccess),
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
  }>({});

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;

    updateUser({ name });
  }

  return (
    <div>
      <h2 className="mb-3 font-semibold text-sm">
        {localization.settings.userProfile}
      </h2>

      <form onSubmit={handleSubmit}>
        <Card className={cn(className)}>
          <CardContent className="flex flex-col gap-6">
            <Field data-invalid={!!fieldErrors.name}>
              <Label htmlFor="name">{localization.auth.name}</Label>

              {session ? (
                <Input
                  aria-invalid={!!fieldErrors.name}
                  autoComplete="name"
                  defaultValue={session.user.name}
                  disabled={isPending}
                  id="name"
                  key={session.user.name}
                  name="name"
                  onChange={() => {
                    setFieldErrors((prev) => ({
                      ...prev,
                      name: undefined,
                    }));
                  }}
                  onInvalid={(e) => {
                    e.preventDefault();

                    setFieldErrors((prev) => ({
                      ...prev,
                      name: (e.target as HTMLInputElement).validationMessage,
                    }));
                  }}
                  placeholder={localization.auth.name}
                  required
                />
              ) : (
                <Skeleton>
                  <Input className="invisible" />
                </Skeleton>
              )}

              <FieldError>{fieldErrors.name}</FieldError>
            </Field>
          </CardContent>

          <CardFooter>
            <Button disabled={isPending || !session} size="sm" type="submit">
              {isPending && <Spinner />}

              {localization.settings.saveChanges}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
