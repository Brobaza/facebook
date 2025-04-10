import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { OverviewAppView } from 'src/sections/overview/app/view';
import { MediaHome } from 'src/sections/social';

// ----------------------------------------------------------------------

const metadata = { title: `Dashboard - ${CONFIG.site.name}` };

export default function OverviewAppPage() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      {/* <OverviewAppView /> */}
      <MediaHome />
    </>
  );
}
