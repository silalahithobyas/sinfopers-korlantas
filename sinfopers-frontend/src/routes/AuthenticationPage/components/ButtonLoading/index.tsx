import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
    className?: string;
}

export const ButtonLoading = ({ className }: Props) => {
    return (
        <Button
            disabled
            className={`bg-blue-800 hover:bg-blue-800 text-white ${className}`}
        >
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
        </Button>
    );
};