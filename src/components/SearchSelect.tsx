import { useEffect, useRef, useState } from "react"

// Componente de select com busca reutilizável
 export function SearchSelect({
  options,
  value,
  onChange,
  placeholder,
  footer,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder: string
  footer?: React.ReactNode
}) {
  const [search, setSearch] = useState(value)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  useEffect(() => { setSearch(value) }, [value])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function openDropdown() {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
        background: '#ffffff',
        border: '1px solid var(--color-border-secondary)',
        borderRadius: 8,
        maxHeight: 200,
        overflowY: 'auto',
        boxShadow: '0 8px 24px rgba(151, 151, 151, 0.6)',
      })
    }
    setOpen(true)
  }

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        className="modal-input"
        style={{ margin: 0 }}
        placeholder={placeholder}
        value={search}
        onChange={e => { setSearch(e.target.value); openDropdown() }}
        onFocus={openDropdown}
      />
      {open && (
        <div style={dropdownStyle}>
          {filtered.length === 0
            ? <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                Nenhum resultado
              </div>
            : filtered.map((o, i) => (
              <div key={i}
                style={{ padding: '8px 12px', fontSize: 13, cursor: 'pointer', color: 'var(--color-text-primary)' }}
                onMouseDown={() => { onChange(o); setSearch(o); setOpen(false) }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                {o}
              </div>
            ))}
          {footer && (
            <div style={{ borderTop: '1px solid var(--color-border-tertiary)' }}>
              {footer}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
