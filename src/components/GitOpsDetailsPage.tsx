import * as _ from 'lodash';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { LoadingBox } from '@patternfly/quickstarts';

import GitOpsDetails from './details/GitOpsDetails';
import GitOpsEmptyState from './GitOpsEmptyState';
import { GitOpsEnvironment } from './utils/gitops-types';
import { getEnvData } from './utils/gitops-utils';

type GitOpsOverviewPageProps = {
  customData: {
    emptyStateMsg: string;
    envs: string[];
    applicationBaseURI: string;
    manifestURL: string;
  };
};
type GitOpsDetailsPageProps = RouteComponentProps<{ appName?: string }> & GitOpsOverviewPageProps;

const GitOpsDetailsPage: React.FC<GitOpsDetailsPageProps> = ({ match, customData }) => {
  const { emptyStateMsg, envs, applicationBaseURI, manifestURL } = customData;
  const { appName } = match.params;

  const [envsData, setEnvsData] = React.useState<GitOpsEnvironment[]>(null);
  const environmentBaseURI = `/api/gitops/environments`;
  const environmentBaseURIV2 = `/api/gitops/environment`;
  const [error, setError] = React.useState<Error>(null);

  React.useEffect(() => {
    const getEnvsData = async () => {
      if (!_.isEmpty(envs) && applicationBaseURI) {
        let data;
        try {
          data = await Promise.all(
            _.map(envs, (env: string) =>
              getEnvData(environmentBaseURIV2, environmentBaseURI, env, applicationBaseURI),
            ),
          );
        } catch (err) {
          setError(err);
        }
        setEnvsData(data);
      }
    };

    getEnvsData();
  }, [applicationBaseURI, environmentBaseURIV2, environmentBaseURI, envs, error]);

  return (
    <>
      {!envsData ? (
        <LoadingBox />
      ) : !emptyStateMsg ? (
        <GitOpsDetails envs={envsData} appName={appName} manifestURL={manifestURL} error={error} />
      ) : (
        <GitOpsEmptyState emptyStateMsg={emptyStateMsg} />
      )}
    </>
  );
};

export default GitOpsDetailsPage;
