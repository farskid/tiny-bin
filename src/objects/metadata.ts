
/* IMPORT */

import colors from 'tiny-colors';
import Addon from '~/objects/addon';

/* MAIN */

class Metadata extends Addon {

  /* VARIABLES */

  name: string = 'bin';
  description: string = '';
  version: string = '0.0.0';
  colors: boolean = true;
  exiter: boolean = true;
  updater: boolean = true;

  /* API */

  print (): void {

    this.logger.print ( `${colors.cyan ( this.name )} ${colors.dim ( this.version )}` );
    this.logger.print ();

  }

}

/* EXPORT */

export default Metadata;
