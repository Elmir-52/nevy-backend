import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Query } from "@nestjs/common";
import { NotesService } from "./notes.service";
import { CreateNoteDto, GetNoteParamsDto, GetNotesQueryDto, NoteResponseDto, UpdateNoteDto } from "./dto";

@Controller('notes')
export class NotesController {
    constructor(private notesService: NotesService) {}

    @Get()
    getMany(@Query() { userId }: GetNotesQueryDto): Promise<NoteResponseDto[]> {
        return this.notesService.getMany(userId);
    }

    @Get(':noteId')
    getOne(@Param() { noteId }: GetNoteParamsDto): Promise<NoteResponseDto> {
        return this.notesService.getOne(noteId);
    }

    @Post()
    create(@Body() data: CreateNoteDto): Promise<void> {
        return this.notesService.create(data);
    }

    @Patch(':noteId')
    update(@Param() { noteId }: GetNoteParamsDto, @Body() data: UpdateNoteDto): Promise<void> {
        return this.notesService.update(noteId, data);
    }

    @Delete(':noteId')
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(@Param() { noteId }: GetNoteParamsDto): Promise<void> {
        return this.notesService.delete(noteId);
    }
}