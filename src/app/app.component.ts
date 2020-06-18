import { Component, OnDestroy, OnInit } from "@angular/core";

import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { StopWatchService, TimerParams } from "./stopwatch.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  public title = "stopwatch";
  public time: TimerParams = <TimerParams>{};
  public ticks: Date = new Date(0, 0, 0, 0, 0, 0);

  private destroy$ = new Subject<void>();

  constructor(private stopWatchService: StopWatchService) {}

  ngOnInit(): void {
    // events lisners
    this.stopWatchService.startStop(this.getElement("start"));
    this.stopWatchService.wait(this.getElement("wait"));
    this.stopWatchService.reset(this.getElement("reset"));

    this.stopWatchService.timer
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        this.time = val;
        this.resetStopwatch();
        this.ticks.setSeconds(val.val);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetStopwatch() {
    this.ticks = new Date(0, 0, 0, 0, 0, 0);
  }

  private getElement(id: string): HTMLElement {
    return document.getElementById(id);
  }
}
