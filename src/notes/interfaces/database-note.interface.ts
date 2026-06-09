export interface DatabaseNote {
    note_id: string;
    user_id: string;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date;
    color: string;
}