import React from "react";
import { Route, Switch } from "react-router-dom";
import "./App.css";
import Immutable from "immutable";
import { Storage } from "@stacks/storage";
import { UserSession } from "@stacks/connect";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQueryClient
} from "react-query";
import { WorkspaceView } from "./Workspace";
import { NodeView } from "./NodeView";
import { RelationContext } from "./DataContext";

import { INTERESTS, saveDataStore } from "./storage";

import { useQueries } from "./useQueries";

import { GraphView } from "./GraphView";

import { Repair } from "./Repair";

export const TIMELINE = "TIMELINE";

type AppProps = {
  userSession: UserSession;
  createStackStore: (userSession: UserSession) => Storage;
};

function ViewContainer({
  children
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className="h-100">
      <div
        id="app-container"
        className="menu-default menu-sub-hidden main-hidden sub-hidden"
      >
        <main>
          <div className="container-fluid">
            <div className="dashboard-wrapper">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export function Main({ userSession, createStackStore }: AppProps): JSX.Element {
  const queryClient = useQueryClient();
  const storage = createStackStore(userSession);
  const { userQuery, storageQuery } = useQueries({ userSession, storage });

  const updateStorageMutation = useMutation(
    (newData: Store) => saveDataStore(storage, newData),
    {
      onMutate: async (newStore: Store) => {
        await queryClient.cancelQueries("store");
        const previousValue = queryClient.getQueryData("store");
        queryClient.setQueryData("store", newStore);
        return previousValue;
      },
      onError: (err, variables, previousValue) => {
        queryClient.setQueryData("store", previousValue);
      }
    }
  );
  if (
    userQuery.isLoading ||
    storageQuery.isLoading ||
    storageQuery.data === undefined
  ) {
    return <div className="loading" role="alert" aria-busy="true" />;
  }

  const dataStore = storageQuery.data;

  const upsertNodes = (nodes: Immutable.Map<string, KnowNode>): void => {
    const newStorage = {
      nodes: dataStore.nodes.merge(nodes),
      workspaces: Immutable.List<Workspace>()
    };
    updateStorageMutation.mutate(newStorage);
  };

  const deleteNodes = (nodes: Immutable.Set<string>, toUpdate: Nodes): void => {
    const newStorage = {
      nodes: dataStore.nodes.merge(toUpdate).removeAll(nodes),
      workspaces: Immutable.List<Workspace>()
    };
    updateStorageMutation.mutate(newStorage);
  };

  return (
    <RelationContext.Provider
      value={{
        nodes: dataStore.nodes,
        upsertNodes,
        deleteNodes
      }}
    >
      <Switch>
        <Route exact path="/">
          <WorkspaceView
            workspace={dataStore.workspaces.get(0, {
              columns: Immutable.List([
                {
                  nodeViews: Immutable.List([
                    { nodeID: INTERESTS },
                    { nodeID: TIMELINE }
                  ])
                }
              ])
            })}
          />
        </Route>
        <Route path="/notes/:id">
          <ViewContainer>
            <NodeView />
          </ViewContainer>
        </Route>
        <Route path="/graph/:id">
          <GraphView />
        </Route>
        <Route exact path="/graph">
          <GraphView />
        </Route>
        <Route exact path="/repair">
          <Repair />
        </Route>
      </Switch>
    </RelationContext.Provider>
  );
}

function App({ userSession, createStackStore }: AppProps): JSX.Element {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Main userSession={userSession} createStackStore={createStackStore} />
    </QueryClientProvider>
  );
}

export default App;
