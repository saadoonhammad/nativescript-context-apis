import { Common } from "./context-apis.common";

import ActivityTransitionReceiver = es.uji.geotec.contextapis.activityrecognition.ActivityTransitionReceiver;
import ActivityTransitionReceiverDelegate = es.uji.geotec.contextapis.activityrecognition.ActivityTransitionReceiverDelegate;
import { getAndroidActivityTransitionReceiver } from "./internal/activity-recognition/recognizers/low-res/android/receiver.android";

import ActivityUpdateReceiver = es.uji.geotec.contextapis.activityrecognition.ActivityUpdateReceiver;
import ActivityUpdateReceiverDelegate = es.uji.geotec.contextapis.activityrecognition.ActivityUpdateReceiverDelegate;
import { getAndroidActivityUpdateReceiver } from "./internal/activity-recognition/recognizers/medium-res/android/receiver.android";

import BootReceiver = es.uji.geotec.contextapis.BootReceiver;
import BootReceiverDelegate = es.uji.geotec.contextapis.BootReceiverDelegate;
import { getBootReceiver } from "./internal/activity-recognition/recognizers/boot-receiver.android";

import AccelerometerRecordingService = es.uji.geotec.contextapis.activityrecognition.AccelerometerRecordingService;
import AccelerometerRecordingServiceDelegate = es.uji.geotec.contextapis.activityrecognition.AccelerometerRecordingServiceDelegate;
import { getAccelerometerRecordingService } from "./internal/activity-recognition/recognizers/high-res/recognition-engine/android/accelerometer-recording-service.android";

export class ContextApis extends Common {
  async init(): Promise<void> {
    this.wireUpNativeComponents();
    await super.init();
  }

  private wireUpNativeComponents() {
    this.wireUpBootReceiver();
    this.wireUpActivityTransitionReceiver();
    this.wireUpActivityUpdateReceiver();
    this.wireUpAccelerometerRecordingService();
  }

  private wireUpBootReceiver() {
    BootReceiver.setBootReceiverDelegate(
      new BootReceiverDelegate({
        onReceive: (context, intent) =>
          getBootReceiver().onReceive(context, intent),
      })
    );
  }

  private wireUpActivityTransitionReceiver() {
    ActivityTransitionReceiver.setActivityTransitionReceiverDelegate(
      new ActivityTransitionReceiverDelegate({
        onReceive: (context, intent) =>
          getAndroidActivityTransitionReceiver().onReceive(context, intent),
      })
    );
  }

  private wireUpActivityUpdateReceiver() {
    ActivityUpdateReceiver.setActivityUpdateReceiverDelegate(
      new ActivityUpdateReceiverDelegate({
        onReceive: (context, intent) =>
          getAndroidActivityUpdateReceiver().onReceive(context, intent),
      })
    );
  }

  private wireUpAccelerometerRecordingService() {
    AccelerometerRecordingService.setAccelerometerRecordingServiceDelegate(
      new AccelerometerRecordingServiceDelegate({
        onCreate: (nativeService) => getAccelerometerRecordingService().onCreate(nativeService),
        onStartCommand: (intent, flags, startId) => getAccelerometerRecordingService().onStartCommand(intent, flags, startId),
        onDestroy: () => getAccelerometerRecordingService().onDestroy(),
      })
    );
  }
}
export const contextApis = new ContextApis();
