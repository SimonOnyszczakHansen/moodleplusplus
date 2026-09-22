import { ISubject } from './subject.model';
import { ITask } from './task.model';
import { IQuiz } from './quiz.model';

export interface IDashboard {
	username: string;
	subjects: ISubject[];
	tasks: ITask[];
	quizzes: IQuiz[];
}