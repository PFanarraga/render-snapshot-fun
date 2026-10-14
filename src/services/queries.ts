import { queryOptions } from "@tanstack/react-query";
import { api } from "./api";

export const q = {
  meta: () => queryOptions({ queryKey: ["meta"], queryFn: api.meta }),
  teams: () => queryOptions({ queryKey: ["teams"], queryFn: api.teams }),
  standings: () => queryOptions({ queryKey: ["standings"], queryFn: api.standings }),
  team: (id: string) => queryOptions({ queryKey: ["team", id], queryFn: () => api.team(id) }),
  matches: () => queryOptions({ queryKey: ["matches"], queryFn: api.matches }),
  match: (id: string) => queryOptions({ queryKey: ["match", id], queryFn: () => api.match(id) }),
  opportunities: () => queryOptions({ queryKey: ["opportunities"], queryFn: api.opportunities }),
  players: () => queryOptions({ queryKey: ["players"], queryFn: api.players }),
  player: (id: string) => queryOptions({ queryKey: ["player", id], queryFn: () => api.player(id) }),
  intelligence: () => queryOptions({ queryKey: ["intelligence"], queryFn: api.intelligence }),
  history: () => queryOptions({ queryKey: ["history"], queryFn: api.history }),
  lab: () => queryOptions({ queryKey: ["lab"], queryFn: api.lab }),
  alerts: () => queryOptions({ queryKey: ["alerts"], queryFn: api.alerts }),
};
