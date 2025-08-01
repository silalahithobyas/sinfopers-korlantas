// src/routes/UserManagementPage/components/EditUserDialog.tsx
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import axiosClient from "@/networks/apiClient";

const formSchema = z.object({
    email: z.string().email("Email tidak valid").optional().or(z.literal("")),
    role: z.enum(["admin", "hr", "pimpinan", "anggota"]),
    is_active: z.boolean(),
});

interface User {
    id: string;
    username: string;
    email: string | null;
    role: 'admin' | 'hr' | 'pimpinan' | 'anggota';
    is_active: boolean;
}

interface EditUserDialogProps {
    user: User | null;
    onSuccess: () => void;
}

const EditUserDialog = ({ user, onSuccess }: EditUserDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            role: "anggota",
            is_active: true,
        },
    });

    useEffect(() => {
        if (user) {
            form.reset({
                email: user.email || "",
                role: user.role,
                is_active: user.is_active,
            });
        }
    }, [user, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) return;

        try {
            setIsLoading(true);
            const response = await axiosClient.put(`/auth/users/${user.id}/`, values);
            if (response.data.success) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error updating user:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Edit User: {user.username}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="email@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="hr">HR</SelectItem>
                                        <SelectItem value="pimpinan">Pimpinan</SelectItem>
                                        <SelectItem value="anggota">Anggota</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>User Aktif</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    );
};

export default EditUserDialog;