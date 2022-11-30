import { Controller, method, accept } from '@curveball/controller';
import { Context } from '@curveball/core';
import { Forbidden } from '@curveball/http-errors';
import * as privilegeService from '../privilege/service';
import { getSettings, settingsRules } from '../server-settings';
import * as hal from './formats/hal';
import * as csv from './formats/csv';

class SettingsController extends Controller {

  @method('GET')
  @accept('application/hal+json')
  async getJson(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
    }

    ctx.response.links.add({
      href: ctx.path,
      rel: 'alternate',
      type: 'text/csv'
    });

    ctx.response.body = hal.settings(settingsRules, getSettings());

  }

  @method('GET')
  @accept('csv')
  async getCsv(ctx: Context) {

    if (!await privilegeService.hasPrivilege(ctx, 'admin')) {
      throw new Forbidden('Only users with the "admin" privilege can inspect OAuth2 clients that are not your own');
    }
    ctx.response.links.add({
      href: ctx.path,
      rel: 'alternate',
      type: 'application/hal+json'
    });

    ctx.response.type = 'text/csv';
    ctx.response.body = csv.settings(settingsRules, getSettings());

  }

}

export default new SettingsController();
