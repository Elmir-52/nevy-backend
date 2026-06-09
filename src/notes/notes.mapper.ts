import { NoteResponseDto } from "./dto/note-response.dto";
import { DatabaseNote } from "./interfaces/database-note.interface";

export class NotesMapper {
    static toNoteResponseDto(dbNote: DatabaseNote): NoteResponseDto {
        const dto = new NoteResponseDto();
        dto.noteId = dbNote.note_id;
        dto.userId = dbNote.user_id
        dto.title = dbNote.title;
        dto.content = dbNote.content;
        dto.createdAt = dbNote.created_at;
        dto.updatedAt = dbNote.updated_at;
        dto.color = dbNote.color;
        return dto;
    }
}