import { Injectable, NotFoundException } from "@nestjs/common";
import { SqlService } from "src/postgres/sql.service";
import { DatabaseNote } from "./interfaces/database-note.interface";
import { NotesMapper } from "./notes.mapper";
import { CreateNoteDto, NoteResponseDto, UpdateNoteDto } from "./dto";

@Injectable()
export class NotesService {
    constructor(private sqlService: SqlService) {}

    async getMany(userId: string): Promise<NoteResponseDto[]> {
        const dbNotes = await this.sqlService.sql<DatabaseNote[]>`
            SELECT * FROM notes
            WHERE user_id = ${userId};
        `;

        const notesResponse: NoteResponseDto[] = dbNotes.map((dbNote: DatabaseNote) => {
            return NotesMapper.toNoteResponseDto(dbNote)
        });

        return notesResponse;
    }

    async getOne(noteId: string, userId: string): Promise<NoteResponseDto> {
        const [ dbNote ] = await this.sqlService.sql<DatabaseNote[]>`
            SELECT * FROM notes
            WHERE note_id = ${noteId} AND user_id = ${userId};
        `;

        if (!dbNote) {
            throw new NotFoundException('Not found');
        }

        return NotesMapper.toNoteResponseDto(dbNote);
    }

    
    async create(data: CreateNoteDto, userId: string): Promise<NoteResponseDto> {
        const [ dbNote ] = await this.sqlService.sql<DatabaseNote[]>`
            INSERT INTO notes
            (user_id, title, content, color)
            VALUES (
                ${userId},
                ${data.title},
                ${data.content},
                ${data.color}
            )
            RETURNING * ;
        `;

        return NotesMapper.toNoteResponseDto(dbNote);
    }

    async update(noteId: string, data: UpdateNoteDto, userId: string): Promise<void> {
        await this.sqlService.sql`
            UPDATE notes
            SET title = ${data.title}, content = ${data.content}, updated_at = NOW()
            WHERE note_id = ${noteId} AND user_id = ${userId};
        `;
    }

    
    async delete(noteId: string, userId: string): Promise<void> {
        await this.sqlService.sql`
            DELETE FROM notes
            WHERE note_id = ${noteId} AND user_id = ${userId};
        `;
    }
}