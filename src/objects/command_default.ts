
/* IMPORT */

import parseArgv from 'tiny-parse-argv';
import Command from '~/objects/command';
import {getClosest, isUndefined} from '~/utils';
import type Bin from '~/objects/bin';
import type {ParsedArgs} from 'tiny-parse-argv';

/* MAIN */

class CommandDefault extends Command {

  /* CONSTRUCTOR */

  constructor ( bin: Bin ) {

    super ( bin, {
      name: '_default',
      description: 'Execute the default action',
      hidden: true
    });

  }

  /* API */

  async run ( options: ParsedArgs, argv: string[] ): Promise<void> {

    const name = options._[0] || this.name;

    if ( options['help'] || name === 'help' ) {

      return this.bin.commands.run ( 'help', options, argv );

    } else if ( options['version'] ) {

      return this.bin.commands.run ( '_version', options, argv );

    } else {

      //TODO: Detect conflicting options

      const isDefault = !this.bin.commands.has ( name );
      const command = isDefault ? this.bin.command : this.bin.commands.getOrFail ( name );
      const options = [...this.bin.command.options.getAll (), ...command.options.getAll ()];
      const minArgs = command.arguments.getAll ().filter ( arg => arg.required ).length;

      const parseArgvOptions = {
        known: <string[]> [],
        boolean: <string[]> [],
        string: <string[]> [],
        required: <string[]> [],
        alias: <Record<string, string[]>> {},
        default: <Record<string, any>> {},
        onMissing: ( options: string[] ): void => {
          this.bin.fail ( `Missing required option: "${options[0]}"` );
        },
        onUnknown: ( options: string[] ): void => {
          const closest = getClosest ( parseArgvOptions.known, options[0] );
          this.bin.fail ( `Unknonw option: "${options[0]}"${closest ? `. Did you mean "${closest}"?` : ''}` );
        }
      };

      options.forEach ( option => {
        parseArgvOptions.known.push ( ...option.data.alls );
        if ( option.data.type === 'boolean' ) {
          parseArgvOptions.boolean.push ( ...option.data.alls );
        }
        if ( option.data.type === 'string' ) {
          parseArgvOptions.string.push ( ...option.data.alls );
        }
        if ( option.required ) {
          parseArgvOptions.required.push ( ...option.data.alls );
        }
        if ( !isUndefined ( option.default ) ) {
          parseArgvOptions.default[option.data.alls[0]] = option.default;
        }
        const [first, ...rest] = option.data.alls;
        parseArgvOptions.alias[first] = rest;
      });

      //TODO: Maybe always camel-case options automatically

      const parsed = parseArgv ( argv, parseArgvOptions );

      if ( !isDefault ) {
        parsed._.shift ();
      }

      const actualArgs = parsed._.length;

      if ( actualArgs < minArgs ) {
        this.bin.fail ( `Expected at least ${minArgs} arguments, but received ${actualArgs}` );
      }

      if ( isDefault ) {

        if ( !this.handler ) {

          this.bin.fail ( 'Command handler not defined for default command' );

        } else {

          return this.handler ( parsed, parsed._, parsed['--'] );

        }

      } else {

        return command.run ( parsed, argv );

      }

    }

  }

}

/* EXPORT */

export default CommandDefault;
