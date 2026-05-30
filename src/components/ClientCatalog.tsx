import { useEffect, useState } from "react";
import { TableLayout } from "../components/Table";
import '../style/catalog.css'
import { ClientService } from "../shared/services/ClientService";
import { useAuth } from "../shared/context/AuthContext";
import { FilterPopover } from "./Filter";


interface IClient {
    id: number;
    storeName: string;
    owner: string;
    cnpj: string;
    address: string;
}

    const INITIAL_FILTER = { storeName: '', owner: '', cnpj: ''}
export function ClientCatalog(){
    const {token} = useAuth();
    const [clients, setClients] = useState<IClient[]>([]);
    const [refresh, setRefresh] = useState(false);
    const [filter, setFilter] = useState(INITIAL_FILTER);


    useEffect(() => {
        ClientService.getAll(token).then(c => setClients(c))
    }, [refresh])

    const filterClient = clients.filter(c => {
        const matchStoreName = !filter.storeName || c.storeName.toLowerCase().includes(filter.storeName.toLocaleLowerCase());
        const matchOwner = !filter.owner || c.owner.toLowerCase().includes(filter.owner.toLocaleLowerCase());
        const matchCnpj = !filter.cnpj || c.cnpj.toLowerCase().includes(filter.cnpj.toLocaleLowerCase());

        return matchStoreName || matchOwner || matchCnpj
    })

    const hasFilter = !!(filter.cnpj || filter.owner || filter.storeName)


        return(<>
            <TableLayout
                title="Clientes"
                filter = {
                    <FilterPopover
                        hasFilter = {hasFilter}
                        onClear={() => setFilter(INITIAL_FILTER)}
                        fields={[
                            {label: 'Loja', placeholder: 'Nome da loja', value: filter.storeName, onChange: v => setFilter(f => ({...f, storeName: v}))},
                            {label: 'Responsável', placeholder: 'Nome do responsável', value: filter.owner, onChange: v => setFilter(f => ({...f, owner: v}))},
                            {label: 'CNPJ', placeholder: 'Cnpj do cliente', value: filter.cnpj, onChange: v => setFilter(f => ({...f, cnpj: v}))}
                        ]}
                    />
                }
    
                headers={<>
                <th>ID</th><th>Loja</th><th>Responsável</th><th>CNPJ</th><th>Endereço</th>
                </>}
                >

                    {filterClient.length === 0
                        ? <tr><td colSpan={5} className="empty-row">Nenhum resultado encontrado</td></tr>
                        : filterClient.map((client, i) => {
                            return (
                                <tr key={i}>
                                    <td>{client.id}</td>
                                    <td>{client.storeName}</td>
                                    <td>{client.owner}</td>
                                    <td>{client.cnpj}</td>
                                    <td>{client.address}</td>
                                </tr>
                            )
                        })}



            </TableLayout>
        
        </>)
}