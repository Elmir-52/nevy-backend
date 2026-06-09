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

    async getOne(noteId: string): Promise<NoteResponseDto> {
        const [ dbNote ] = await this.sqlService.sql<DatabaseNote[]>`
            SELECT * FROM notes
            WHERE note_id = ${noteId};
        `;

        if (!dbNote) {
            throw new NotFoundException('Not found');
        }

        return NotesMapper.toNoteResponseDto(dbNote);
    }

    
    async create(data: CreateNoteDto): Promise<void> {
        await this.sqlService.sql`
            INSERT INTO notes
            (user_id, title, content, created_at, updated_at, color)
            VALUES (
                ${data.userId},
                ${data.title}, 
                ${data.content}, 
                ${data.createdAt}, 
                ${data.updatedAt}, 
                ${data.color}
            );
        `;
    }


    async update(noteId: string, data: UpdateNoteDto): Promise<void> {
        await this.sqlService.sql`
            UPDATE notes
            SET title = ${data.title}, content = ${data.content}, updated_at = ${data.updatedAt}
            WHERE note_id = ${noteId};
        `;
    }

    
    async delete(noteId: string): Promise<void> {
        await this.sqlService.sql`
            DELETE FROM notes
            WHERE note_id = ${noteId};
        `;
    }
}