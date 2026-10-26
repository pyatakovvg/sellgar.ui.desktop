import { UseBindings } from '@sellgar/app';
import { Application, type ApplicationConfiguratorInterface } from '@sellgar/app/next';

import { DesktopBindings } from './bindings/desktop.bindings';

@UseBindings(DesktopBindings)
class DesktopApplication extends Application {
  protected configure(app: ApplicationConfiguratorInterface) {
    app.features([]);

    app.initializers([]);

    app.metrics([]);
  }
}
export function createApplication(): DesktopApplication {
  const app = new DesktopApplication();

  app.reporter([]);

  return app;
}
