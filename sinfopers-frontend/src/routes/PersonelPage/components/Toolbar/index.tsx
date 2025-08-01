// src/routes/PersonelPage/components/Toolbar/index.tsx
import { Button } from "@/components/ui/button";
import FilterDropdown from "../FilterDropdown";
import { DownloadIcon, FileSpreadsheet, UserPlus, Upload } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import LinkPersonilToUserDialog from "../LinkPersonilToUserDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosClient from "@/networks/apiClient";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/hooks/useAuth/types";
import { useState } from "react";
import ImportPersonelDialog from "../Dialog/ImportPersonelDialog";

interface Props {
  onApplyFilter: (type: string, value: string) => void;
  onRefresh: () => void;
}

const Toolbar = ({ onApplyFilter, onRefresh }: Props) => {
  const { hasRole } = useAuth();
  const canEdit = hasRole([UserRole.ADMIN, UserRole.HR]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await axiosClient.get(
          "/personil/export/",
          {
            responseType: "blob",
          }
      );

      console.log("Export response received, content type:", response.headers['content-type']);

      const pdfBlob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

      // Create a temporary URL for the Blob
      const url = window.URL.createObjectURL(pdfBlob);

      // Create a temporary <a> element to trigger the download
      const tempLink = document.createElement("a");
      tempLink.href = url;
      tempLink.setAttribute(
          "download",
          `rekap_data_personil.xlsx`
      ); // Set the desired filename for the downloaded file

      // Append the <a> element to the body and click it to trigger the download
      document.body.appendChild(tempLink);
      tempLink.click();

      // Clean up the temporary elements and URL
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading Data:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      }
    }
  }

  return (
      <div className="flex w-full justify-between">
        <FilterDropdown onApplyFilter={onApplyFilter} />

        <div className="flex gap-2">
          {/* Tampilkan tombol hubungkan user dengan personil hanya jika user adalah HR atau Admin */}
          {canEdit && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setIsLinkDialogOpen(true)}
                >
                  <UserPlus className="mr-2" /> Hubungkan User dengan Personil
                </Button>

                <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                  <LinkPersonilToUserDialog 
                    onSuccess={() => {
                      setIsLinkDialogOpen(false);
                      onRefresh();
                    }}
                  />
                </Dialog>

                <Button 
                  variant="outline"
                  onClick={() => setIsImportDialogOpen(true)}
                >
                  <Upload className="mr-2" /> Import CSV
                </Button>

                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <ImportPersonelDialog 
                    onSuccess={() => {
                      setIsImportDialogOpen(false);
                      onRefresh();
                      window.location.reload();
                    }}
                  />
                </Dialog>
              </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="px-8" onClick={handleDownload}>
                <DownloadIcon className="mr-2" /> Unduh
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-primary">
              <DropdownMenuItem onClick={handleDownload} className="bg-primary text-white">
                <FileSpreadsheet className="mr-2" />
                Microsoft Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
  );
};

export default Toolbar;