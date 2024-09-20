import type {
  ManualEntry,
  AutoEntry,
  ResolvedEntryDocument,
} from "@/types/entry";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addManualEntry, deleteEntry, updateEntry } from "@/lib/actions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NumberInput } from "@/components/ui/number-input";
import { MultiSelect } from "@/components/ui/multi-select";
import { useClient } from "@/hooks/useClient";
import type { User } from "@/types/user";
import { firstName, hashEmail } from "@/lib/utils";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { AvatarProps } from "@radix-ui/react-avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SubmitDialogProps {
  entry: ResolvedEntryDocument | null;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const formatTimeToHtmlInput = (date?: string) => {
  return new Date(date || new Date()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTimeToDate = (time?: string, date?: string) => {
  const currentDate = date
    ? new Date(date).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  return new Date(`${currentDate}T${time}:00`).toISOString();
};

type FormValues = ManualEntry | AutoEntry;

export const SubmitDialog = ({
  entry,
  open,
  onClose,
  onSubmit,
}: SubmitDialogProps) => {
  console.log("entry dialog", entry);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserSelectOpen, setIsUserSelectOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { data: allUsers } = useClient<User[]>(
    `*[_type== "user"] | order(name)`,
  );
  const allUserOptions = useMemo(() => {
    return (
      allUsers?.map((user) => ({
        label: user.name,
        shortLabel: firstName(user.name),
        value: hashEmail(user.email),
        icon: (props: AvatarProps) => (
          <Avatar {...props}>
            <AvatarImage src={user.image || undefined} />
          </Avatar>
        ),
      })) || []
    );
  }, [allUsers]);
  const defaultUsers = useMemo(() => {
    return entry?.users?.map((user) => hashEmail(user.email)) || [];
  }, [entry]);

  const form = useForm<FormValues>({
    defaultValues: {
      location: "inside",
      pees: 0,
      poops: 0,
      startTime: formatTimeToHtmlInput(),
      endTime: formatTimeToHtmlInput(),
      users: [],
    },
  });

  useEffect(() => {
    form.reset({
      location: entry?.location || "inside",
      pees: entry?.pees || 0,
      poops: entry?.poops || 0,
      startTime: formatTimeToHtmlInput(entry?.startTime),
      endTime: formatTimeToHtmlInput(entry?.endTime),
      users: entry?.users?.map((user) => ({
        _type: "reference",
        _ref: hashEmail(user.email),
      })),
    });
  }, [entry, form]);

  const onSubmitForm = async (data: FormValues) => {
    setIsLoading(true);

    const formattedData = {
      startTime: formatTimeToDate(data.startTime, entry?.startTime),
      endTime: formatTimeToDate(data.endTime, entry?.endTime),
      pees: data.pees,
      poops: data.poops,
      location: entry?.mode === "auto" ? "outside" : data.location,
      users: data.users,
    };

    if (entry) {
      await updateEntry(entry._id, formattedData as AutoEntry);
    } else {
      await addManualEntry(formattedData as ManualEntry);
    }

    setIsLoading(false);
    onSubmit();
  };

  const handleDelete = async () => {
    if (!entry) return;

    setIsLoading(true);
    deleteEntry(entry._id);
    setIsLoading(false);
    onSubmit();
  };

  const handleDialogClose = () => {
    if (!isUserSelectOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent
        className="p-4 max-w-sm !w-[90dvw] text-center"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="mb-1">
          <DialogDescription>
            {entry
              ? "Legg til informasjon om turen"
              : "Legg til informasjon om turen manuelt"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForm)}>
            {!entry && (
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Hvor var Billy?</FormLabel>
                    <FormControl>
                      <Tabs
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <TabsList>
                          <TabsTrigger value="inside">Inne</TabsTrigger>
                          <TabsTrigger value="outside">Ute</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="pees"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Hvor mange ganger tissa Billy?</FormLabel>
                  <FormControl>
                    <NumberInput
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="poops"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Hvor mange ganger bæsja han?</FormLabel>
                  <FormControl>
                    <NumberInput
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AnimatePresence initial={false}>
              {form.watch("location") === "outside" && (
                <motion.fieldset
                  className="grid gap-3 grid-cols-2"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.6, ease: "anticipate" }}
                >
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start tid</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slutt tid</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.fieldset>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {form.watch("location") === "outside" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.6, ease: "anticipate" }}
                >
                  <FormField
                    control={form.control}
                    name="users"
                    render={({ field }) => (
                      <FormItem className="mb-5">
                        <FormLabel>Hvem var med å gå?</FormLabel>
                        <FormControl>
                          <MultiSelect
                            placeholder="Velg turgåere"
                            defaultValue={defaultUsers}
                            options={allUserOptions}
                            onValueChange={(value: string[]) =>
                              field.onChange(
                                value.map((_ref) => ({
                                  _type: "reference",
                                  _ref,
                                })),
                              )
                            }
                            value={field.value?.map((u) => u._ref) || []}
                            onOpenChange={setIsUserSelectOpen}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <footer className="flex gap-2 bg-background relative z-10">
              {entry?.status === "completed" && (
                <AlertDialog
                  open={isDeleteAlertOpen}
                  onOpenChange={setIsDeleteAlertOpen}
                >
                  <AlertDialogTrigger
                    type="button"
                    className={buttonVariants({
                      variant: "destructive",
                      className: "w-full",
                    })}
                    disabled={isLoading}
                  >
                    Slett
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-xs">
                    <AlertDialogHeader>Vil du slette turen?</AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Avbryt</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className={buttonVariants({ variant: "destructive" })}
                      >
                        Slett
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lagre tur
              </Button>
            </footer>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
