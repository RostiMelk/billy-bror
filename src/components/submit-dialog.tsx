import type { ManualEntry, AutoEntry, EntryDocument } from "@/types/entry";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addManualEntry, deleteEntry, updateEntry } from "@/lib/actions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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
import { NumberInput } from "./ui/number-input";

interface SubmitDialogProps {
  entry: EntryDocument | null;
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

const formatTimeToDate = (time?: string) => {
  const currentDate = new Date().toISOString().split("T")[0];
  return new Date(`${currentDate}T${time}:00`).toISOString();
};

type FormValues = ManualEntry | AutoEntry;

export const SubmitDialog = ({
  entry,
  open,
  onClose,
  onSubmit,
}: SubmitDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      location: "inside",
      pees: 0,
      poops: 0,
      startTime: formatTimeToHtmlInput(),
      endTime: formatTimeToHtmlInput(),
    },
  });

  useEffect(() => {
    if (entry) {
      form.reset({
        location: entry.location || "inside",
        pees: entry.pees || 0,
        poops: entry.poops || 0,
        startTime: formatTimeToHtmlInput(entry.startTime),
        endTime: formatTimeToHtmlInput(entry.endTime),
      });
    }
  }, [entry, form]);

  const onSubmitForm = async (data: FormValues) => {
    setIsLoading(true);

    const formattedData = {
      startTime: formatTimeToDate(data.startTime),
      endTime: formatTimeToDate(data.endTime),
      pees: data.pees,
      poops: data.poops,
      location: entry ? undefined : data.location,
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
    await deleteEntry(entry._id);
    setIsLoading(false);
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              {(entry || form.watch("location") === "outside") && (
                <motion.fieldset
                  className="grid gap-3 grid-cols-2"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
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

            <footer className="flex gap-2 bg-background relative z-10">
              {entry?.status === "completed" && (
                <Button
                  type="button"
                  onClick={handleDelete}
                  variant="destructive"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Slett
                </Button>
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
