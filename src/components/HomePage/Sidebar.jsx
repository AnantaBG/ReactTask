import { useContext, useEffect, useState } from "react";
import { CgNotes } from "react-icons/cg";
import { MdDoneOutline } from "react-icons/md";
import { RiProgress1Line, RiTodoLine } from "react-icons/ri";
import { Link, useLocation } from "react-router-dom";
import { AuthC } from "../Auth/AuthProviderx";

const Sidebar = () => {
    const { user, logOut } = useContext(AuthC);
    const [activeLink, setActiveLink] = useState("/");
    const location = useLocation();

    const TaskCategory = [
        {
            title: "All Tasks",
            icon: <CgNotes />,
            link: "/"
        },
        {
            title: "To-Do",
            icon: <RiTodoLine />,
            link: "/todo" // Add the leading slash
        },
        {
            title: "In-Progrss",
            icon: <RiProgress1Line />,
            link: "/inprogress" // Add the leading slash
        },
        {
            title: "Done",
            icon: <MdDoneOutline />,
            link: "/done" // Add the leading slash
        }
    ];

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);
    return (
        <>
            <div className="">
                <h2 className="text-xl md:text-2xl font-semibold">{user?.displayName}</h2>
                <h2 className="my-2 text-[10px] sm:text-xs md:text-sm text-gray-600">{user?.email}</h2>
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