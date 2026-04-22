import { useEffect, useRef, useState } from "react"
import './Filter.css'

interface FilterField {
  label: string,
  type?: 'text'| 'date',
  placeholder?: string,
  value: string,
  onChange: (v:string) => void
}

interface FilterPopoverProps{
  fields: FilterField[],
  hasFilter: boolean,
  onClear: () => void
}
export function FilterPopover({fields, hasFilter, onClear}: FilterPopoverProps ){
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent){
      if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return(<div className="filter-wrapper" ref={ref}>
    <button className={`btn-secondary ${hasFilter ? 'btn-filter-active': ''}`}
    onClick={() => setOpen( v=> !v)}>
      ≡ Filtros {hasFilter && <span className="filter-dot" />}
    </button>
    {open && (
      <div className="filter-popover">
        <p className="filter-title">Filtrar por</p>

        {fields.map((field, i) => (
          <div key={i}>
            <label className="filter-label">{field.label}</label>
            <input
              className="filter-input"
              type={field.type ?? 'text'}
              placeholder={field.placeholder}
              value={field.value}
              onChange={e => field.onChange(e.target.value)}
            />
          </div>
        ))}
          <button className="btn-ghost" onClick={onClear}>Limpar filtros</button>
      </div>
    )}
 
  </div>)
}