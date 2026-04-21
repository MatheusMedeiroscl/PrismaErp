import type {  ReactNode } from "react"
import { createPortal } from "react-dom"


import './Modal.css'
  interface IModalProps{
    title: string,
    onClose: () => void,
    children: ReactNode,
    footer?: ReactNode
  }
export function Modal({ title, onClose, children, footer }: IModalProps) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>  {/* ← overlay correto */}
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">   {/* ← dentro do .modal */}
          {children}
        </div>

        {footer && (
          <div className="modal-footer">  {/* ← dentro do .modal */}
            {footer}
          </div>
        )}
      </div>  {/* ← fecha .modal aqui */}
    </div>,
    document.body
  )
}