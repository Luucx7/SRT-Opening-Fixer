import { DateTime } from "luxon";
import fs from "fs";
import path from "path";

/*
 * Settings
 */
const START: string = '00:01:23,000'; // When the opening starts
const TO_BE_ADDED_MS: number = 90000; // How much MS should be added after that specific time
const INPUT_PATH = './input';   // Where to read the subtitles on
const OUTPUT_PATH = './output'; // Where to save the retimed SRT file
/*
 * Application Constraints
 */

const WHOLE_SEPARATOR: string = `

`; // this thing separates each section of the SRT file (each subtitle)
const LINE_SEPARATOR: string = ' --> '; // Separates the two parts of the time
const FAKE_DATE_START = '2023-03-07T'; // My birthday 😁 and also an fake date just to use as base for calculations
const FAKE_START = DateTime.fromISO(FAKE_DATE_START + START); // A fake luxon date that marks the start of when to add the DIFF
/*
 * Actual code
 */
for (const fileName of fs.readdirSync(INPUT_PATH)) {
    const filePath = path.join(INPUT_PATH, fileName);

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    processFile(fileName, fileContent);
}

function processFile(fileName: string, rawFileString: string) {
    const SPLITTED_SUBTITLE: string[] = rawFileString.split(WHOLE_SEPARATOR);
    let new_srt = ''; // The whole NEW SRT will be written here

    // Loops throght the subtitles
    for (const RAW_SPLITTED of SPLITTED_SUBTITLE) {
        const SPLITTED: string[] = RAW_SPLITTED.split('\n'); // split it by lines too
        if (SPLITTED[0] === '') continue; // sometime it's empty, whatever
    
        const SPLIT_PART: string[] = SPLITTED[1].split(LINE_SEPARATOR); // the spplited line with both times
    
        const START_PART: string = SPLIT_PART[0].trim();
        const END_PART: string = SPLIT_PART[1].trim();
    
        let start_time = DateTime.fromISO(FAKE_DATE_START + START_PART); // Fake dates for calculation
        let end_time = DateTime.fromISO(FAKE_DATE_START + END_PART);
    
        if (FAKE_START > start_time) { // It's before our start, so we just keep it as-is
            new_srt += SPLITTED[0] + '\n';
            new_srt += SPLITTED[1] + '\n';
            new_srt += SPLITTED[2] + '\n';
            if (SPLITTED[3] !== undefined) new_srt += SPLITTED[3] + '\n'; // well, there are subtitles with multiple lines so I'll do it the worst way I can imagine
            if (SPLITTED[4] !== undefined) new_srt += SPLITTED[4] + '\n';
            if (SPLITTED[5] !== undefined) new_srt += SPLITTED[5] + '\n';
            if (SPLITTED[6] !== undefined) new_srt += SPLITTED[6] + '\n';
            if (SPLITTED[7] !== undefined) new_srt += SPLITTED[7] + '\n';
    
            new_srt += '\n';
        } else {
            const new_start_date = start_time.plus({ // New date objects with the diff applied
                milliseconds: TO_BE_ADDED_MS
            });
            const new_end_date = end_time.plus({
                milliseconds: TO_BE_ADDED_MS
            });
    
            const NEW_START_TIME = new_start_date.toISOTime()?.replace('.', ',').split('-')[0]; // Fix it to be compatible, changing . to , and removing the timezone info
            const NEW_END_TIME = new_end_date.toISOTime()?.replace('.', ',').split('-')[0];
            const NEW_TIMES_STR = `${NEW_START_TIME} --> ${NEW_END_TIME}`; // the new final time string as it will look in the SRT file
    
            new_srt += SPLITTED[0] + '\n';
            new_srt += NEW_TIMES_STR + '\n';
            new_srt += SPLITTED[2] + '\n';
            if (SPLITTED[3] !== undefined) new_srt += SPLITTED[3] + '\n';
            if (SPLITTED[4] !== undefined) new_srt += SPLITTED[4] + '\n';
            if (SPLITTED[5] !== undefined) new_srt += SPLITTED[5] + '\n';
            if (SPLITTED[6] !== undefined) new_srt += SPLITTED[6] + '\n';
            if (SPLITTED[7] !== undefined) new_srt += SPLITTED[7] + '\n';
    
            new_srt += '\n'
        }
    }

    const output_file_path = path.join(OUTPUT_PATH, fileName);
    fs.writeFileSync(output_file_path, new_srt); // It's fine :D
}
