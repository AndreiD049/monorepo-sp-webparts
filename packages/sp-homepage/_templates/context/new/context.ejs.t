---
to: src/webparts/<%= h.webPart %>/context/<%= Name %>Context/index.ts
unless_exists: true
---
import * as React from "react";
import I<%= Name %>Context from "./I<%= Name %>Context";

export const <%= Name %>Context = React.createContext<I<%= Name %>Context>(null); 