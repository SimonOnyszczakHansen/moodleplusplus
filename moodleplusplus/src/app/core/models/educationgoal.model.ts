// Matches backend TaskObjectiveDto(ObjectiveId, SubjectId, Content).
export interface IObjective {
    objectiveId: string;
    subjectId: string;
    content: string;
}