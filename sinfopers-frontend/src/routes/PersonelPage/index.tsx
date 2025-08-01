// src/routes/PersonelPage/index.tsx
import { Navbar, NavbarPageEnum } from "@/components/Navbar";
import Toolbar from "./components/Toolbar";
import DefaultContainer from "@/components/DefaultContainer";
import { DataTable } from "./components/DataTable";
import Navigation from "./components/Navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import useGetPersonnel from "./hooks/useGetPersonnel";
import FooterCopyright from "@/components/FooterCopyright";
// import TableIncomplateUser from "./components/IncomplateUserDataTable/TableIncomplateUser";
// import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog } from "@/components/ui/dialog";
import LinkPersonilToUserDialog from "./components/LinkPersonilToUserDialog";
import Header from "./components/Header";

const HomePage = () => {
  const [page, setPage] = useState<number>(1);
  const [filterType, setFilterType] = useState<string>();
  const [filterValue, setFilterValue] = useState<string>();
  const [isLinkPersonilDialogOpen, setIsLinkPersonilDialogOpen] = useState(false);

  const { listPersonnel, loading, totalPages, mutate } = useGetPersonnel({
    page,
    limit: 10,
    filterType,
    filterValue,
  });

  const { toast } = useToast();
  const location = useLocation();

  const afterLogin = location.state?.afterLogin;

  useEffect(() => {
    if (afterLogin) {
      toast({
        title: "Logged In!",
        description: "Success login to your account",
      });
    }
  }, []);

  const onChangePage = (newPage: number) => {
    setPage(newPage);
    mutate();
  };

  const onApplyFilter = (type: string, value: string) => {
    setFilterType(type.toLowerCase());
    setFilterValue(value);
    mutate();
  };
  
  const handleRefresh = () => {
    mutate();
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Navbar page={NavbarPageEnum.personnelDatabase} />

        <div className="flex-1 w-full flex flex-col">
          <DefaultContainer>
            <div className="flex justify-between items-center mb-4">
            <Header />
            </div>
            
            <Toolbar 
              onApplyFilter={onApplyFilter} 
              onRefresh={handleRefresh} 
            />
            
            {loading ? (
                <div className="flex justify-center my-8">
                  <Loader2 className="h-12 w-12 animate-spin" />
                </div>
              ) : (
                <>
                  <DataTable data={listPersonnel || []} />
                  <Navigation
                    currentPage={page}
                    totalPages={Number(totalPages)}
                    onChangePage={onChangePage}
                  />
                </>
            )}
          </DefaultContainer>
        </div>

        <FooterCopyright />

        <Toaster />

        {/* Dialog untuk menghubungkan user dengan personil */}
        <Dialog open={isLinkPersonilDialogOpen} onOpenChange={setIsLinkPersonilDialogOpen}>
          <LinkPersonilToUserDialog
            onSuccess={() => {
              setIsLinkPersonilDialogOpen(false);
              mutate();
            }}
          />
        </Dialog>
      </div>


  );
};

export default HomePage;