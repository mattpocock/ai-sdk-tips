import {
  accessSync,
  existsSync,
  readdirSync,
  readFileSync,
  unlinkSync,
} from 'fs';
import { join } from 'path';
import { styleText } from 'util';

const EXERCISE_DIR = 'exercises';

const sections = readdirSync(EXERCISE_DIR);

// Group errors by section and exercise
const groupedErrors: {
  [section: string]: {
    [exercise: string]: string[];
  };
} = {};

const addError = (
  section: string,
  exercise: string,
  error: string,
) => {
  if (!groupedErrors[section]) {
    groupedErrors[section] = {};
  }
  if (!groupedErrors[section][exercise]) {
    groupedErrors[section][exercise] = [];
  }
  groupedErrors[section][exercise].push(error);
};

for (const section of sections) {
  const sectionDir = join(EXERCISE_DIR, section);
  const exercises = readdirSync(sectionDir);

  const sectionNumber = section.split('-')[0]!;

  for (const exercise of exercises) {
    const exerciseDir = join(sectionDir, exercise);

    const topLevelFilesAndFolders = readdirSync(exerciseDir);

    const folderForReadme = topLevelFilesAndFolders.find(
      (folder) => folder === 'problem' || folder === 'explainer',
    );

    const solutionFolderExists = topLevelFilesAndFolders.find(
      (folder) => folder === 'solution',
    );

    const allFilesRecursively = readdirSync(exerciseDir, {
      recursive: true,
    });

    // IMPROPER NUMBER FORMAT
    const exerciseNumber = exercise.split('-')[0]!;
    if (!exerciseNumber?.startsWith(sectionNumber)) {
      addError(
        section,
        exercise,
        `Exercise number does not start with ${sectionNumber}`,
      );
    }

    // AUTO DELETE .gitkeep FILES
    const gitKeepFile = allFilesRecursively.find((file) =>
      file.includes('.gitkeep'),
    );

    if (allFilesRecursively.length > 0 && gitKeepFile) {
      unlinkSync(join(exerciseDir, gitKeepFile as string));
    }

    // NO PROBLEM OR EXPLAINER FOLDER
    if (!folderForReadme) {
      addError(
        section,
        exercise,
        'No problem or explainer folder found',
      );
      continue;
    }

    // NO README.MD FILE
    const readmeExists = existsSync(
      join(exerciseDir, folderForReadme, 'readme.md'),
    );

    if (!readmeExists) {
      addError(section, exercise, 'No readme.md file found');
    }

    // NO MAIN.TS FILE IN PROBLEM OR EXPLAINER FOLDER
    const mainTsExists = existsSync(
      join(exerciseDir, folderForReadme, 'main.ts'),
    );

    if (!mainTsExists) {
      addError(
        section,
        exercise,
        'No main.ts file found in problem or explainer folder',
      );
    }

    // NO MAIN.TS FILE IN SOLUTION FOLDER
    if (solutionFolderExists) {
      const solutionMainTsExists = existsSync(
        join(exerciseDir, 'solution', 'main.ts'),
      );

      if (!solutionMainTsExists) {
        addError(
          section,
          exercise,
          'No main.ts file found in solution folder',
        );
      }
    }
  }
}

// Output grouped errors with proper indentation
for (const [section, exercises] of Object.entries(
  groupedErrors,
)) {
  console.log(styleText(['bold'], section));

  for (const [exercise, errors] of Object.entries(exercises)) {
    console.log(`  ${exercise}`);

    for (const error of errors) {
      console.log(styleText(['red'], `    ${error}`));
    }
  }
}

if (Object.keys(groupedErrors).length > 0) {
  process.exitCode = 1;
}
