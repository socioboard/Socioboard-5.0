import { metrics, type Counter } from '@opentelemetry/api';

let deliveries: Counter | undefined;

/**
 * A delivery reached its final outcome (`socioboard.publish.deliveries`, by network and
 * outcome): what a failed-publish alert in OpenObserve counts. Retries aren't counted until
 * they end.
 * Created on first use, after `startTelemetry()`; without it this is a no-op.
 */
export function recordDelivery(network: string, outcome: 'published' | 'failed'): void {
  deliveries ??= metrics.getMeter('socioboard').createCounter('socioboard.publish.deliveries', {
    description: 'Deliveries that reached their final outcome',
  });
  deliveries.add(1, { network, outcome });
}

/** Tests: forget the counter, so the next call registers it with the current meter provider. */
export function resetMetricsForTests(): void {
  deliveries = undefined;
}
