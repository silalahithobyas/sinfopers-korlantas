import { useEffect, useState } from "react";
import axiosClient from "@/networks/apiClient";
import { Navbar, NavbarPageEnum } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { 
  User, Mail, Shield, UserCircle, Hash, Users,
  Briefcase, Award, Building2, LayoutGrid, CheckCircle2, GitBranch 
} from "lucide-react";

interface UserData {
  id: string;
  username: string;
  email: string | null;
  role: string;
}

interface PersonnelData {
  id: string;
  nama: string;
  nrp: string;
  jenis_kelamin: string;
  jabatan: string | null;
  pangkat: string | null;
  subsatker: string | null;
  subdit: string | null;
  status: string;
  bko: string;
}

interface CompleteData {
  user: UserData;
  personnel?: PersonnelData;
}

const MyDataPersonel = () => {
  const [data, setData] = useState<CompleteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axiosClient.get("/person-detail/data");
        console.log("Data dari API:", res.data);
        setData(res.data);
        setError(null);
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
        setError("Gagal mengambil data. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gray-50">
        <Navbar page={NavbarPageEnum.myData} />
        <div className="my-2 md:my-5 mx-2 md:mx-20 lg:mx-28 flex flex-col items-start justify-start">
          <div className="w-full flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen w-full bg-gray-50">
        <Navbar page={NavbarPageEnum.myData} />
        <div className="my-2 md:my-5 mx-2 md:mx-20 lg:mx-28 flex flex-col items-start justify-start">
          <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 flex items-center">
              <Shield className="mr-2 h-5 w-5" /> {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Format jenis kelamin
  const formatJenisKelamin = (jk: string) => {
    if (jk === "L") return "Laki-laki";
    if (jk === "P") return "Perempuan";
    return jk;
  };

  const userData = data?.user ? [
    { 
      label: "Username", 
      value: data.user.username, 
      icon: <User className="h-5 w-5 text-blue-800" />
    },
    { 
      label: "Email", 
      value: data.user.email || <span className="text-gray-400 italic">Belum ada email terdaftar</span>,
      icon: <Mail className="h-5 w-5 text-blue-800" />
    },
    { 
      label: "Role", 
      value: data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1),
      icon: <Shield className="h-5 w-5 text-blue-800" />
    },
  ] : [];

  const personnelData = data?.personnel ? [
    { 
      label: "Nama", 
      value: data.personnel.nama,
      icon: <UserCircle className="h-5 w-5 text-blue-800" />
    },
    { 
      label: "NRP", 
      value: data.personnel.nrp,
      icon: <Hash className="h-5 w-5 text-blue-800" />
    },
    { 
      label: "Jenis Kelamin", 
      value: formatJenisKelamin(data.personnel.jenis_kelamin),
      icon: <Users className="h-5 w-5 text-blue-800" />
    },
    { 
      label: "Jabatan", 
      value: data.personnel.jabatan || <span className="text-gray-400 italic">Belum ada jabatan</span>,
      icon: <Briefcase className="h-5 w-5 text-blue-800" />
    },
    { 
      label: "Pangkat", 
      value: data.personnel.pangkat || <span className="text-gray-400 italic">Belum ada pangkat</span>,
      icon: <Award className="h-5 w-5 text-blue-800" />
    },
    { 
      label: "Sub Satker", 
      value: data.personnel.subsatker || <span className="text-gray-400 italic">Belum ada sub satker</span>,
      icon: <Building2 className="h-5 w-5 text-blue-800" />
    },
    { 
      label: "Subdit", 
      value: data.personnel.subdit || <span className="text-gray-400 italic">Belum ada subdit</span>,
      icon: <LayoutGrid className="h-5 w-5 text-blue-800" />
    },
    { 
      label: "Status", 
      value: data.personnel.status,
      icon: <CheckCircle2 className="h-5 w-5 text-blue-800" />
    },
    { 
      label: "BKO", 
      value: data.personnel.bko === "-" ? <span className="text-gray-400">-</span> : data.personnel.bko,
      icon: <GitBranch className="h-5 w-5 text-blue-800" />
    }
  ] : [];

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      <Navbar page={NavbarPageEnum.myData} />
      <div className="my-4 md:my-8 mx-2 md:mx-20 lg:mx-28 flex flex-col items-start justify-start">
        {data ? (
          <div className="w-full max-w-4xl mx-auto">
            {/* User Data Card */}
            <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
              <div className="bg-blue-800 px-6 py-4">
                <h2 className="font-bold text-xl md:text-2xl text-yellow-300">
                  Data Pengguna
            </h2>
              </div>
              <div className="p-6">
                {userData.map((item, index) => (
                <div
                  key={index}
                    className="flex items-center py-3 border-b border-gray-100 last:border-0"
                >
                    <div className="flex items-center w-56">
                      {item.icon}
                      <span className="ml-3 text-gray-600 font-medium">{item.label}</span>
                    </div>
                    <div className="flex-1 text-gray-800">
                    {item.value}
                    </div>
                </div>
              ))}
              </div>
            </div>

            {/* Personnel Data Card */}
            <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
              <div className="bg-blue-800 px-6 py-4">
                <h2 className="font-bold text-xl md:text-2xl text-yellow-300">
                  Data Personel
                </h2>
              </div>
              <div className="p-6">
                {data.personnel ? (
                  <>
                    {personnelData.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center w-56">
                          {item.icon}
                          <span className="ml-3 text-gray-600 font-medium">{item.label}</span>
                        </div>
                        <div className="flex-1 text-gray-800">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Akun Anda belum terhubung dengan data personel. Silakan hubungi admin atau HR untuk menghubungkan akun Anda dengan data personel.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Button */}
            <div className="flex justify-center">
              <Link to={"/change-password"}>
                <button className="px-6 py-3 rounded-lg bg-blue-800 text-yellow-300 text-lg font-medium transition-colors hover:bg-blue-900 shadow-md hover:shadow-lg flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Ganti Password
                </button>
            </Link>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">Tidak ada data yang tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDataPersonel;
