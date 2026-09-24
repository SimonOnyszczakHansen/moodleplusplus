import { ITask } from './task.model';
import { IQuiz } from './quiz.model';

export interface IDashboard {
  username: string;
  tasks: ITask[];
  quizzes: IQuiz[];
}
