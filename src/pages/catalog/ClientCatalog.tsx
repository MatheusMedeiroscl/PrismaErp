import { useEffect, useState } from "react";
import { TableLayout } from "../../components/Table";
import { useAuth } from "../../shared/context/AuthContext";
import { FilterPopover } from "../../components/Filter";
import { formatCnpj } from "../../shared/utils/Format";
import { useModal } from "../../shared/hooks/Modal";
import { Modal } from "../../components/Modal";
import type { IClient } from "../../shared/utils/Models";
import { Services } from "../../shared/services/Services";



const INITIAL_FILTER = { storeName: "", owner: "", cnpj: "" };
const INITIAL_CLIENT = {
  id: 0,
  storeName: "",
  owner: "",
  email: "",
  cnpj: "",
  address: "",
};

export function ClientCatalog() {
  const { token } = useAuth();
  const [clients, setClients] = useState<IClient[]>([]);
  const { open, close, isOpen } = useModal();
  const [selectedClient, setSelectedClient] = useState(INITIAL_CLIENT);
  const [refresh, setRefresh] = useState(false);
  const [filter, setFilter] = useState(INITIAL_FILTER);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    client: IClient;
  } | null>(null);

  useEffect(() => {
    Services.getAll(token, "client").then((c) => setClients(c));
  }, [refresh]);

  const handleUpdate = async () => {
    console.log(selectedClient);
    
    await Services.update(token, "client", selectedClient.id, {
      storeName: selectedClient.storeName,
      owner: selectedClient.owner,
      email: selectedClient.email,
      cnpj: selectedClient.cnpj,
      address: selectedClient.address,
    });

    setSelectedClient(INITIAL_CLIENT);
    setRefresh(!refresh);
    close();
  };

  const handleDelete = async () => {
    await Services.delete(token, "client", selectedClient.id);
    setSelectedClient(INITIAL_CLIENT);
    setRefresh(!refresh);
    close();
  };

  const filterClient = (clients ?? []).filter((c) => {
    const matchStoreName =
      !filter.storeName ||
      c.storeName.toLowerCase().includes(filter.storeName.toLocaleLowerCase());
    const matchOwner =
      !filter.owner ||
      c.owner.toLowerCase().includes(filter.owner.toLocaleLowerCase());
    const matchCnpj =
      !filter.cnpj ||
      c.cnpj.toLowerCase().includes(filter.cnpj.toLocaleLowerCase());

    return matchStoreName &&  matchOwner && matchCnpj;
  });

  const hasFilter = !!(filter.cnpj || filter.owner || filter.storeName);

  const handleDropdown = (
    e: React.MouseEvent<HTMLButtonElement>,
    client: IClient,
  ) => {
    if (dropdownPos) return setDropdownPos(null); // fecha se já está aberto
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom, left: rect.right - 160, client });
  };

  return (
    <>
      <TableLayout
        title="Clientes"
        filter={
          <FilterPopover
            hasFilter={hasFilter}
            onClear={() => setFilter(INITIAL_FILTER)}
            fields={[
              {
                label: "Loja",
                placeholder: "Nome da loja",
                value: filter.storeName,
                onChange: (v) => setFilter((f) => ({ ...f, storeName: v })),
              },
              {
                label: "Responsável",
                placeholder: "Nome do responsável",
                value: filter.owner,
                onChange: (v) => setFilter((f) => ({ ...f, owner: v })),
              },
              {
                label: "CNPJ",
                placeholder: "Cnpj do cliente",
                value: filter.cnpj,
                onChange: (v) => setFilter((f) => ({ ...f, cnpj: v })),
              },
            ]}
          />
        }
        headers={
          <><th>ID</th><th>Loja</th><th>Responsável</th><th>email</th><th>CNPJ</th><th>Endereço</th><th>Ações</th></>}
      >
        {filterClient.length === 0 ? (
          <tr>
            <td colSpan={5} className="empty-row">
              Nenhum resultado encontrado
            </td>
          </tr>
        ) : (
          filterClient.map((client, i) => {
            return (
              <tr key={i}>
                <td>{client.id}</td>
                <td>{client.storeName}</td>
                <td>{client.owner}</td>
                <td>{client.email}</td>
                <td>{formatCnpj(client.cnpj)}</td>
                <td>{client.address}</td>
                <td style={{ position: "relative" }}>
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      handleDropdown(e, client);
                      setSelectedClient({
                        id: client.id,
                        storeName: client.storeName,
                        owner: client.owner,
                        email: client.email,
                        cnpj: client.cnpj,
                        address: client.address,
                      });
                    }}
                  >
                    ···
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </TableLayout>

      {dropdownPos && (
        <div
          className="dropdownCard"
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            zIndex: 1000,
          }}
        >
          <p
            className="dropdownBtn"
            onClick={() => {
              open();
              setDropdownPos(null);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            🟡 Editar
          </p>

          <p
            className="dropdownBtn"
            onClick={() => {
              handleDelete();
              setDropdownPos(null);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            🔴 Deletar
          </p>
        </div>
      )}

      {isOpen && (
        <Modal
          title="Editar Cliente"
          onClose={close}
          footer={
            <>
              <button className="btn-secondary" onClick={close}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleUpdate}>
                Salvar
              </button>
            </>
          }
        >
          <>
            <label className="modal-label">Estabelecimento</label>
            <input
              className="modal-input"
              type="text"
              placeholder={selectedClient.storeName}
              onChange={(e) =>
                setSelectedClient((f) => ({ ...f, storeName: e.target.value }))
              }
            />

            <label className="modal-label">Responsável</label>
            <input
              className="modal-input"
              type="text"
              placeholder={selectedClient.owner}
              onChange={(e) =>
                setSelectedClient((f) => ({ ...f, owner: e.target.value }))
              }
            />

            <label className="modal-label">Email</label>
            <input
              className="modal-input"
              type="text"
              placeholder={selectedClient.email}
              onChange={(e) =>
                setSelectedClient((f) => ({ ...f, email: e.target.value }))
              }
            />

            <label className="modal-label">CNPJ</label>
            <input
              className="modal-input"
              type="text"
              placeholder={selectedClient.cnpj}
              onChange={(e) =>
                setSelectedClient((f) => ({ ...f, cnpj: e.target.value }))
              }
            />

            <label className="modal-label">Endereço</label>
            <input
              className="modal-input"
              type="text"
              placeholder={selectedClient.address}
              onChange={(e) =>
                setSelectedClient((f) => ({ ...f, address: e.target.value }))
              }
            />
          </>
        </Modal>
      )}
    </>
  );
}
