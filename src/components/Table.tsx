import type { ReactNode } from "react"
import './styles/Table.css'



interface ITable {
    title: string,
    filter?: ReactNode
    children: ReactNode
    headers: ReactNode
}

export function TableLayout ({title, filter, children, headers}: ITable) {

    return (
        <div className="table-card full-width">
            <div className="table-card-header">
                <h3 className="chart-title">{title}</h3>
                {filter}
            </div>
            <table>
                <thead>
                    <tr>
                        {headers}
                    </tr>
                </thead>
                <tbody>
                        {children}
                </tbody>
            </table>
        </div>
    
    )
}