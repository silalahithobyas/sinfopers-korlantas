import FooterCopyright from "@/components/FooterCopyright";
import CardLogin from "./components/CardLogin";
import Navbar from "./components/Navbar";

const AuthenticationPage = () => {
    return (
        <div className="flex flex-col min-h-screen w-full bg-lightBlue">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <CardLogin />
            </div>
            <FooterCopyright />
        </div>
    );
};

export default AuthenticationPage;