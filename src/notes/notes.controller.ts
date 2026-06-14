import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { NotesService } from "./notes.service";
import { CreateNoteDto, GetNoteParamsDto, NoteResponseDto, UpdateNoteDto } from "./dto";
import { AuthGuard } from "src/auth/auth.guard";
import { JwtPayloadDto } from "src/auth/dto";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";

@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
    constructor(private notesService: NotesService) {}

    @Get()
    getMany(
        @CurrentUser() user: JwtPayloadDto,
    ): Promise<NoteResponseDto[]> {
        return this.notesService.getMany(user.userId);
    }

    @Get(':noteId')
    getOne(
        @Param() { noteId }: GetNoteParamsDto,
        @CurrentUser() user: JwtPayloadDto,
    ): Promise<NoteResponseDto> {
        return this.notesService.getOne(noteId, user.userId);
    }

    @Post()
    create(
        @Body() data: CreateNoteDto,
        @CurrentUser() user: JwtPayloadDto,
    ): Promise<NoteResponseDto> {
        return this.notesService.create(data, user.userId);
    }

    @Patch(':noteId')
    update(
        @Param() { noteId }: GetNoteParamsDto, 
        @Body() data: UpdateNoteDto,
        @CurrentUser() user: JwtPayloadDto,
    ): Promise<void> {
        return this.notesService.update(noteId, data, user.userId);
    }

    @Delete(':noteId')
    @HttpCode(HttpStatus.NO_CONTENT)
    delete(
        @Param() { noteId }: GetNoteParamsDto,
        @CurrentUser() user: JwtPayloadDto,
    ): Promise<void> {
        return this.notesService.delete(noteId, user.userId);
    }
}