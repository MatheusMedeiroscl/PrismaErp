import type React from "react";
import { Sidebar } from "../../components/SideBar";
import './AppLayout.css'

export function AppLayout({children}: React.PropsWithChildren){
    return(<div className="app-layout">
        <Sidebar/>
            <main>{children}</main>
    </div>)
}