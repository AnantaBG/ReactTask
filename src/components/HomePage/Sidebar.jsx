import { useContext, useEffect, useState } from "react";
import { CgNotes } from "react-icons/cg";
import { Link, useLocation } from "react-router-dom";
import { AuthC } from "../Auth/AuthProviderx";

const Sidebar = () => {
    const { user, logOut } = useContext(AuthC);
    const [activeLink, setActiveLink] = useState("/");
    const location = useLocation();

    const TaskCategory = [
        {
            title: "Details",
            icon: <CgNotes />,
            link: "/"
        }
    ];

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);
    return (
        <>
            <div className="">
                <h2 className=" md:text-2xl font-semibold">{user?.displayName}</h2>
         
                <hr />
            </div>
            <div className="">
                {
                    TaskCategory.map((Tasks, id) => (
                        <Link
                        to={Tasks.link}
                        key={id}
                        className={`my-2 flex items-center gap-2 text-xl p-1 rounded-xl transition-all duration-300
                            ${activeLink === Tasks.link ? "bg-white" : "hover:bg-gray-200"}`}
                    >
                        {Tasks.icon} {Tasks.title}
                    </Link>
                    )
                )
                }
            </div>
            {user?.email && (
                <div>
                <button onClick={logOut} className="w-full bg-slate-500 text-white p-1 rounded">Log-Out</button>
            </div>
            )
        }
            
        </>
    );
};

export default Sidebar;