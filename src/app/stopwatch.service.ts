import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { timer, of, fromEvent } from "rxjs";
import {
  mapTo,
  map,
  switchMap,
  scan,
  merge,
  filter,
  bufferCount,
} from "rxjs/operators";

interface Params {
  pause: boolean;
  val: number;
  waitStatus: boolean;
}

export type TimerParams = Partial<Params>;

const DOUBLE_CLICK_DURATION = 300;
const TIMER_SPEED = 1000;

@Injectable({
  providedIn: "root",
})
export class StopWatchService {
  private timerState: TimerParams = {
    waitStatus: false,
    pause: true,
    val: 0,
  };

  private streams$: Observable<any>[] = [];

  private _timer: BehaviorSubject<TimerParams>;

  constructor() {
    this._timer = new BehaviorSubject<TimerParams>(this.timerState);
  }

  get timer() {
    return this._timer.pipe(
      merge(...this.streams$),

      scan((state: TimerParams, curr: TimerParams): any => {
        this.timerState = { ...state, ...curr };
        return this.timerState;
      }, {}),
      switchMap((state: TimerParams) => {
        return state.pause
          ? of(state)
          : timer(0, TIMER_SPEED).pipe(
              map((_) => {
                state.val++;
                return state;
              })
            );
      })
    );
  }

  public startStop(elem: HTMLElement): void {
    const stream = fromEvent(elem, "click").pipe(
      map((_) => {
        this.timerState.pause = !this.timerState.pause;

        const data: TimerParams = { pause: this.timerState.pause };
        if (this.timerState.waitStatus) {
          this.timerState.waitStatus = false;
        } else {
          data.val = 0;
        }
        return data;
      })
    );

    this.streams$.push(stream);
  }

  public wait(elem: HTMLElement): void {
    const stream = fromEvent(elem, "click").pipe(
      map(() => new Date().getTime()),
      bufferCount(2),
      filter((val) => (val[1] - val[0] < DOUBLE_CLICK_DURATION ? true : false)),
      mapTo({ pause: true, waitStatus: true })
    );
    this.streams$.push(stream);
  }

  public reset(elem: HTMLElement): void {
    const stream = fromEvent(elem, "click").pipe(
      mapTo({ pause: false, val: -1 })
    );
    this.streams$.push(stream);
  }
}
