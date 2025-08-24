import { readdirSync, renameSync } from 'fs';
import { join } from 'path';

const EXERCISE_DIR = 'exercises';

const sections = readdirSync(EXERCISE_DIR);

for (const section of sections) {
  const sectionDir = join(EXERCISE_DIR, section);

  const sectionNumber = section.split('-')[0];

  if (typeof sectionNumber !== 'string') {
    throw new Error(`Improper section number: ${section}`);
  }

  const exercises = readdirSync(sectionDir);

  exercises.forEach((exercise, index) => {
    // Move the exercise to the new number
    const newExerciseNumber = `${sectionNumber}.${(index + 1).toString().padStart(2, '0')}`;

    // 007.3-foo-bar-baz -> foo-bar-baz
    const existingExerciseName = exercise
      .split('-')
      .slice(1)
      .join('-');

    const newExerciseName = `${newExerciseNumber}-${existingExerciseName}`;

    // Rename the exercise
    renameSync(
      join(sectionDir, exercise),
      join(sectionDir, newExerciseName),
    );
  });
}
