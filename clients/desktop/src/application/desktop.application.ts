import { UseBindings } from '@sellgar/app';
import { Application, type ApplicationConfiguratorInterface, type ApplicationFactoryContext } from '@sellgar/app/next';

import { CartApplicationProvider, CartApplicationState, CartBindings } from '@widget/cart';

import { DesktopBindings } from './bindings/desktop.bindings';
import { SessionInitializer } from './session/session.initializer';
import { SessionState } from './session/session.state';

export function createApplication(context?: ApplicationFactoryContext): Application {
  class RequestBindings extends DesktopBindings {
    constructor() {
      super(context);
    }
  }

  @UseBindings(RequestBindings, CartBindings)
  class DesktopApplication extends Application {
    protected configure(app: ApplicationConfiguratorInterface) {
      app.features([]);
      app.initializers([SessionInitializer]);
      app.states([SessionState, CartApplicationState]);
      app.providers([CartApplicationProvider]);
      app.metrics([]);
    }
  }

  const app = new DesktopApplication();

  app.reporter([]);

  return app;
}
