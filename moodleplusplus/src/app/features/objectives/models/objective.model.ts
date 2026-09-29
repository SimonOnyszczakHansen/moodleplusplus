import { IObjective } from '../../../core/models/educationgoal.model';

export interface IApiGoal {
	id: string;
	subjectId: string;
	content: string;
}

export interface ICreateObjectiveRequest {
	subjectId: string;
	content: string;
}

export interface IUpdateObjectiveRequest {
	content: string;
}

export function mapApiGoal(api: IApiGoal): IObjective {
	return { objectiveId: api.id, subjectId: api.subjectId, content: api.content };
}

