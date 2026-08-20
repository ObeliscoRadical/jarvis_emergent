import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AREA } from "@/jarvisPreview/constants";

export function NoteDialog({ open, note, onClose, onSave, onDelete, onChange }) {
  if (!note) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="jarvis-dialog" data-testid="node-editor-modal">
        <DialogHeader>
          <DialogTitle data-testid="node-editor-title">
            {note.id ? "Editar memória" : "Nova memória"}
          </DialogTitle>
          <DialogDescription data-testid="node-editor-description">
            Ajuste a malha de memória estratégica desta prévia cinematográfica.
          </DialogDescription>
        </DialogHeader>

        <div className="dialog-grid">
          <div className="dialog-field">
            <label className="dialog-label" htmlFor="note-title">Título</label>
            <Input
              id="note-title"
              value={note.title}
              onChange={(event) => onChange({ ...note, title: event.target.value })}
              className="jarvis-input"
              data-testid="node-title-input"
            />
          </div>

          <div className="dialog-field">
            <label className="dialog-label" htmlFor="note-area">Área</label>
            <Select value={note.area} onValueChange={(value) => onChange({ ...note, area: value })}>
              <SelectTrigger
                id="note-area"
                className="jarvis-select"
                data-testid="node-area-select"
                aria-label="Selecionar área da nota"
              >
                <SelectValue placeholder="Selecione uma área" />
              </SelectTrigger>
              <SelectContent className="jarvis-select-content">
                {Object.entries(AREA).map(([areaKey, areaValue]) => (
                  <SelectItem key={areaKey} value={areaKey} data-testid={`node-area-option-${areaKey}`}>
                    {areaValue.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="dialog-field dialog-field-full">
            <label className="dialog-label" htmlFor="note-body">Conteúdo</label>
            <Textarea
              id="note-body"
              value={note.body}
              onChange={(event) => onChange({ ...note, body: event.target.value })}
              className="jarvis-textarea"
              data-testid="node-body-textarea"
            />
          </div>
        </div>

        <DialogFooter className="jarvis-dialog-footer">
          {note.id ? (
            <Button
              type="button"
              variant="outline"
              className="jarvis-button-secondary"
              data-testid="delete-note-button"
              onClick={() => onDelete(note.id)}
            >
              Excluir
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="jarvis-button-secondary"
            data-testid="cancel-note-button"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="jarvis-button-primary"
            data-testid="save-note-button"
            onClick={() => onSave(note)}
          >
            Salvar memória
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
