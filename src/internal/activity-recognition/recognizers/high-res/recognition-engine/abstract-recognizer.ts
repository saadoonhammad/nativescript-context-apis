import * as fs from "tns-core-modules/file-system";
import { Features } from "./feature-extraction";
import { HumanActivity } from "../../../human-activity";
import { ActivityDetected } from "..";

export type Probas = [string, number][];

export abstract class AbstractRecognizer implements Recognizer {

    protected _interpreter: org.tensorflow.lite.Interpreter;
    protected _labels: string[];
    protected options: RecognizerOptions;
    private memory: Probas[];
    private confidence: number[];

    constructor() {
    }

    abstract recognize(features: Features): ActivityDetected;

    abstract getInterpreter(): org.tensorflow.lite.Interpreter;

    predict(probas: Probas): ActivityDetected {
        this.memory.push(probas);

        const fixedProbas = {};
        for (let i = this.memory.length - 1; i >= 0; i--) {
            for (let j = 0; j < this.memory[i].length; j++) {
                const activity: string = this.memory[i][j][0];
                const activityConfidence: number = this.memory[i][j][1];
                const fixedConfidence = activityConfidence * this.confidence[i];

                fixedProbas[activity] = fixedProbas[activity] ? fixedProbas[activity] + fixedConfidence : fixedConfidence;
            }
        }

        const fixedProbasArray = [];
        for (let activity in fixedProbas) {
            fixedProbasArray.push([activity, fixedProbas[activity]]);
        }
        fixedProbasArray.sort((x, y) => y[1] - x[1]);

        if (this.memory.length === this.options.predicitonMemory) {
            this.memory.shift();
        }

        return this.buildActivityDetected(fixedProbasArray[0]);
    }

    initializeRecognizer(options: RecognizerOptions) {
        options.predicitonMemory = options.predicitonMemory ? options.predicitonMemory : 5;
        options.kBest = options.kBest ? options.kBest : 3;
        this.options = options;
        this.memory = [];
        this.confidence = [];

        for (let i = 0; i < options.predicitonMemory; i++) {
            this.confidence[i] = (i + 1) / options.predicitonMemory;
        }
    }

    isReady() {
        return !!this.options;
    }

    getLabels(): string[] {
        if (!this._labels) {
            const labelsPath = fs.knownFolders.currentApp().path + this.options.labelsFile;
            const content = fs.File.fromPath(labelsPath).readSync();
            this._labels = content.split("\n");
        }

        return this._labels;
    }

    private buildActivityDetected(proba: [string, number]): ActivityDetected {
        return {
            type: this.mapActivityName(proba[0]),
            confidence: proba[1],
            timestamp: new Date()
        };
    }

    private mapActivityName(name: string): HumanActivity {
        switch (name) {
            case "WALK":
                return HumanActivity.WALKING;
            case "RUN":
                return HumanActivity.RUNNING;
            case "STILL":
                return HumanActivity.STILL;
            default:
                throw new Error(
                    `Unrecognized activity: ${name}.`
                );
            // TODO: Add more...
        }
    }
}

export interface Recognizer {
    recognize(features: Features): ActivityDetected;
    predict(probas: Probas): ActivityDetected;
    getInterpreter(): org.tensorflow.lite.Interpreter;
    getLabels(): string[];
}

export interface RecognizerOptions {
    localModelFile: string;
    labelsFile: string;
    predicitonMemory?: number;
    kBest?: number;
}